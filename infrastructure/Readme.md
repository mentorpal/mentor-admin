# Deployment instructions


## Initial setup (already done)
```
aws s3api create-bucket --bucket mentor-admin-tf-state-us-east-1 --region us-east-1
```

Create secret.tfvars file (based on `./template.tfvars`) and then run:
```
terraform init
terraform plan -lock=false -var-file=secret.tfvars --out=tfplan.out
terraform apply -lock=false "tfplan.out"
```
