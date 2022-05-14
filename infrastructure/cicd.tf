module "pipeline" {
  source                  = "git@github.com:mentorpal/terraform-modules//modules/trunk_cicd_pipeline?ref=tags/v1.2.2"
  codestar_connection_arn = var.codestar_connection_arn
  project_name            = "mentor-admin"
  github_repo_name        = "mentor-admin"
  build_cache_type        = "NO_CACHE"
  deploy_cache_type       = "NO_CACHE"
  build_compute_type      = "BUILD_GENERAL1_MEDIUM"
  deploys_compute_type    = "BUILD_GENERAL1_MEDIUM"

  build_buildspec          = "cicd/buildspec.yml"
  deploy_staging_buildspec = "cicd/deployspec_staging.yml"
  deploy_prod_buildspec    = "cicd/deployspec_prod.yml"
  deploys_privileged_mode  = true
  export_pipeline_info     = true

  tags = {
    Source  = "terraform"
    Project = "mentorpal"
  }

  providers = {
    aws = aws.us_east_1
  }
}
