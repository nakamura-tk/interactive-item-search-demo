#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { InteractiveItemSearchDemoServerStack } from "../lib/server-stack";
import { InteractiveItemSearchDemoWebStack } from "../lib/web-stack";
import { InteractiveItemSearchDemoGHAOidcStack } from "../lib/gha-oidc-stack";
import { InteractiveItemSearchDemoEcrStack } from "../lib/ecr-stack";

const app = new cdk.App();
const ecrStack = new InteractiveItemSearchDemoEcrStack(
  app,
  "InteractiveItemSearchDemoEcrStack"
);
new InteractiveItemSearchDemoServerStack(
  app,
  "InteractiveItemSearchDemoServerStack"
).addDependency(ecrStack);
new InteractiveItemSearchDemoWebStack(app, "InteractiveItemSearchDemoWebStack");
new InteractiveItemSearchDemoGHAOidcStack(
  app,
  "InteractiveItemSearchDemoGHAOidcStack"
);
