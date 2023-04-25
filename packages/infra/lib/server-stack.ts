import { Construct } from "constructs";
import { Stack, StackProps } from "aws-cdk-lib";
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { DockerImageFunction, DockerImageCode } from "aws-cdk-lib/aws-lambda";

export class InteractiveItemSearchDemoServerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create the Lambda function
    const lambda = new DockerImageFunction(
      this,
      "InteractiveItemSearchLambda",
      {
        code: DockerImageCode.fromImageAsset("../server"),
      }
    );

    // Create the API Gateway with Lambda proxy integration
    const api = new RestApi(this, "InteractiveItemSearchAPI", {
      deployOptions: {
        tracingEnabled: true,
        stageName: "api",
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
