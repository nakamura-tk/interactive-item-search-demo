import { Construct } from "constructs";
import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { DockerImageFunction, DockerImageCode } from "aws-cdk-lib/aws-lambda";
import { Table, AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { fetchStringParameterValue } from "../util/ssm";

export class InteractiveItemSearchDemoServerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create the DynamoDB table
    const table = new Table(this, "InteractiveItemSearchTable", {
      partitionKey: { name: "session_id", type: AttributeType.STRING },
      sortKey: { name: "sent_at", type: AttributeType.NUMBER },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Create the Lambda function
    const lambda = new DockerImageFunction(
      this,
      "InteractiveItemSearchLambda",
      {
        code: DockerImageCode.fromImageAsset("../server"),
        environment: {
          CHAT_MESSAGE_HISTORY_TABLE_NAME: table.tableName,
          OPENAI_API_KEY: fetchStringParameterValue({
            construct: this,
            parameterName: "OPENAI_API_KEY",
          }),
          OPENAI_ORG_ID: fetchStringParameterValue({
            construct: this,
            parameterName: "OPENAI_ORG_ID",
          }),
        },
      }
    );

    // Create the API Gateway with Lambda proxy integration
    const api = new RestApi(this, "InteractiveItemSearchAPI", {
      deployOptions: {
        tracingEnabled: true,
        stageName: "prod",
      },
      restApiName: "Interactive Item Search API",
    });

    // Create the proxy resource
    api.root.addProxy({
      anyMethod: true,
      defaultIntegration: new LambdaIntegration(lambda),
    });
  }
}
