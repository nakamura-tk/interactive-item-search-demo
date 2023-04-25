import type { Construct } from "constructs";
import {
  Stack,
  type StackProps,
  aws_s3,
  aws_cloudfront,
  aws_cloudfront_origins,
  aws_s3_deployment,
  aws_iam,
  RemovalPolicy,
  Duration,
} from "aws-cdk-lib";

export class InteractiveItemSearchDemoWebStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const webBucket = new aws_s3.Bucket(this, "WebBucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      encryption: aws_s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,
    });

    const originAccessIdentity = new aws_cloudfront.OriginAccessIdentity(
      this,
      "WebOriginAccessIdentity"
    );

    const webSiteBucketPolicyStatement = new aws_iam.PolicyStatement({
      actions: ["s3:GetObject"],
      effect: aws_iam.Effect.ALLOW,
      principals: [
        new aws_iam.CanonicalUserPrincipal(
          originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
        ),
      ],
      resources: [`${webBucket.bucketArn}/*`],
    });

    webBucket.addToResourcePolicy(webSiteBucketPolicyStatement);

    const webDistribution = new aws_cloudfront.Distribution(
      this,
      "WebDistribution",
      {
        defaultRootObject: "index.html",
        errorResponses: [
          {
            ttl: Duration.seconds(300),
            httpStatus: 403,
            responseHttpStatus: 403,
            responsePagePath: "/error.html",
          },
          {
            ttl: Duration.seconds(300),
            httpStatus: 404,
            responseHttpStatus: 404,
            responsePagePath: "/error.html",
          },
        ],
        defaultBehavior: {
          allowedMethods: aws_cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          cachedMethods: aws_cloudfront.CachedMethods.CACHE_GET_HEAD,
          cachePolicy: aws_cloudfront.CachePolicy.CACHING_OPTIMIZED,
          viewerProtocolPolicy:
            aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          origin: new aws_cloudfront_origins.S3Origin(webBucket, {
            originAccessIdentity,
          }),
        },
        priceClass: aws_cloudfront.PriceClass.PRICE_CLASS_ALL,
      }
    );

    new aws_s3_deployment.BucketDeployment(this, "WebDeploy", {
      sources: [
        aws_s3_deployment.Source.asset("../web/build"),
        aws_s3_deployment.Source.data(
          "/error.html",
          "<html><body><h1>Error!</h1></body></html>"
        ),
        aws_s3_deployment.Source.data("/favicon.ico", ""),
      ],
      destinationBucket: webBucket,
      distribution: webDistribution,
      distributionPaths: ["/*"],
    });
  }
}
