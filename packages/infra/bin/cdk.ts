#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { InteractiveItemSearchDemoServerStack } from "../lib/interactive-item-search-demo-stack";

const app = new cdk.App();
new InteractiveItemSearchDemoServerStack(app, "InteractiveItemSearchDemoServerStack");
