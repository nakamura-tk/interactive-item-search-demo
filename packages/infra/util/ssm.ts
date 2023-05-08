import { Construct } from "constructs";
import * as ssm from "aws-cdk-lib/aws-ssm";

interface FetchStringParameterValueOptions {
  construct: Construct;
  parameterName: string;
}

export const fetchStringParameterValue = (
  options: FetchStringParameterValueOptions
): string => {
  const { construct, parameterName } = options;
  const prefix = "/interactive-item-search-demo";

  return ssm.StringParameter.valueForStringParameter(
    construct,
    `${prefix}/${parameterName}`
  );
};
