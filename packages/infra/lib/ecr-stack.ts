import type { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import {
  DockerImageDeployment,
  Source,
  Destination,
} from "cdk-docker-image-deployment";
import { imageTag, repositoryName } from "./constant";

export class InteractiveItemSearchDemoEcrStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repository = new cdk.aws_ecr.Repository(this, "serverRepository", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      repositoryName,
      imageScanOnPush: true,
      imageTagMutability: cdk.aws_ecr.TagMutability.IMMUTABLE,
    });

    new DockerImageDeployment(this, "serverImageDeploy", {
      source: Source.directory("../server"),
      destination: Destination.ecr(repository, {
        tag: imageTag,
      }),
    });
  }
}
