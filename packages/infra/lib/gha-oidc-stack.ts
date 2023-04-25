import { Stack, StackProps, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";

export class InteractiveItemSearchDemoGHAOidcStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const provider = new iam.OpenIdConnectProvider(this, "Provider", {
      url: "https://token.actions.githubusercontent.com",
      thumbprints: [
        "a031c46782e6e6c662c2c87c76da9aa62ccabd8e",
        "6938fd4d98bab03faadb97b34396831e3780aea1",
      ],
      clientIds: ["sts.amazonaws.com"],
    });
    const role = new iam.Role(this, "DeployRole", {
      roleName: "DeployRole",
      maxSessionDuration: Duration.hours(2),
      assumedBy: new iam.WebIdentityPrincipal(
        provider.openIdConnectProviderArn,
        {
          StringEquals: {
            ["token.actions.githubusercontent.com:aud"]: "sts.amazonaws.com",
          },
          StringLike: {
            ["token.actions.githubusercontent.com:sub"]:
              "repo:joe-king-sh/interactive-item-search-demo:*",
          },
        }
      ),
    });
    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess")
    );
  }
}
