
interface AmplifyConfig {
  aws_project_region: string;
  aws_cognito_region: string;
  aws_user_pools_id: string;
  aws_user_pools_web_client_id: string;
  oauth: {
    domain: string;
    scope: string[];
    redirectSignIn: string;
    redirectSignOut: string;
    responseType: string;
  };
  federationTarget: string;
  aws_cognito_username_attributes: string[];
  aws_cognito_social_providers: string[];
  aws_cognito_signup_attributes: string[];
  aws_cognito_mfa_configuration: string;
  aws_cognito_mfa_types: string[];
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: number;
    passwordPolicyCharacters: unknown[];
  };
  aws_cognito_verification_mechanisms: string[];
}

const amplifyConfig: AmplifyConfig = {
  aws_project_region: "us-west-1",
  aws_cognito_region: "us-west-1",
  aws_user_pools_id: "",
  aws_user_pools_web_client_id: "",
  oauth: {
    domain: "",
    scope: ["email", "openid", "profile"],
    redirectSignIn: "http://localhost:3000/",
    redirectSignOut: "http://localhost:3000/",
    responseType: "code"
  },
  federationTarget: "COGNITO_USER_POOLS",
  aws_cognito_username_attributes: ["EMAIL"],
  aws_cognito_social_providers: ["GOOGLE"],
  aws_cognito_signup_attributes: ["EMAIL"],
  aws_cognito_mfa_configuration: "OFF",
  aws_cognito_mfa_types: ["SMS"],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: []
  },
  aws_cognito_verification_mechanisms: ["EMAIL"]
};

export default amplifyConfig;
