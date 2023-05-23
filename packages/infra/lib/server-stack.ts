import { Construct } from "constructs";
import { Stack, StackProps, RemovalPolicy, CfnOutput } from "aws-cdk-lib";
import {
  Role,
  ServicePrincipal,
  PolicyStatement,
  Effect,
  ArnPrincipal
} from "aws-cdk-lib/aws-iam";
import { Service, Source } from "@aws-cdk/aws-apprunner-alpha";
import { Table, AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { Domain, EngineVersion } from 'aws-cdk-lib/aws-opensearchservice';
import { fetchStringParameterValue } from "../util/ssm";
import { imageTag, repositoryName } from "./constant";
import { Repository } from "aws-cdk-lib/aws-ecr";

export class InteractiveItemSearchDemoServerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create the DynamoDB table
    const table = new Table(this, "InteractiveItemSearchTable", {
      partitionKey: { name: "session_id", type: AttributeType.STRING },
      sortKey: { name: "sent_at", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const instanceRole = new Role(
      this,
      "InteractiveItemSearchDemoServerInstanceRole",
      {
        assumedBy: new ServicePrincipal("tasks.apprunner.amazonaws.com"),
      }
    );

    instanceRole.addToPolicy(
      new PolicyStatement({
        // QueryとPutItemを許可する
        actions: ["dynamodb:Query", "dynamodb:PutItem"],
        effect: Effect.ALLOW,
        resources: [table.tableArn],
      })
    );

    const port = 8000;
    const serverService = new Service(
      this,
      "InteractiveItemSearchDemoServerService",
      {
        source: Source.fromEcr({
          imageConfiguration: {
            port,
            environmentVariables: {
              OPENAI_API_KEY: fetchStringParameterValue({
                construct: this,
                parameterName: "OPENAI_API_KEY",
              }),
              OPENAI_ORG_ID: fetchStringParameterValue({
                construct: this,
                parameterName: "OPENAI_ORG_ID",
              }),
              CHAT_MESSAGE_HISTORY_TABLE_NAME: table.tableName,
              PORT: port.toString(),
              APP_VERSION: imageTag,
            },
          },
          // @ts-expect-error
          repository: Repository.fromRepositoryName(
            this,
            "ServerRepositoryFromName",
            repositoryName
          ),
          tagOrDigest: imageTag,
        }),
        // @ts-expect-error
        instanceRole: instanceRole,
      }
    );

    const domain_name = 'item-search-domain'
    const domain = new Domain(this, 'InteractiveItemSearchDomain', {
      domainName: domain_name,
      removalPolicy: RemovalPolicy.DESTROY,
      version: EngineVersion.OPENSEARCH_2_3,
      capacity: {
        dataNodeInstanceType: 't3.small.search',
        dataNodes: 1,
      },
      ebs: {
        volumeSize: 10,
      },
      accessPolicies: [new PolicyStatement({
        effect: Effect.ALLOW,
        principals: [new ArnPrincipal(instanceRole.roleArn)],
        actions: ['es:*'],
        resources: [`arn:aws:es:${this.region}:${this.account}:domain/${domain_name}/*`]
      })
      ]
    })
    serverService.addEnvironmentVariable('OPENSEARCH_ENDPOINT', domain.domainEndpoint)

    new CfnOutput(this, "ServerServiceUrl", {
      exportName: "InteractiveItemSearchDemoServerServiceUrl",
      value: serverService.serviceUrl,
    });
  }
}
