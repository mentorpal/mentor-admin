terraform {
  backend "s3" {
    bucket         = "mentor-admin-tf-state-us-east-1"
    region         = "us-east-1"
    key            = "terraform.tfstate"
  }
}

provider "aws" {
  region = "us-east-1"
  alias  = "us_east_1"
}
