resource "aws_s3_bucket" "reports" {
  bucket = "nyx-corp-pentest-reports"
}

resource "aws_s3_bucket_acl" "reports_acl" {
  bucket = aws_s3_bucket.reports.id
  acl    = "public-read"
}

resource "aws_security_group" "app_sg" {
  name = "app-sg"

  ingress {
    description = "SSH from anywhere"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "App port"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
}
