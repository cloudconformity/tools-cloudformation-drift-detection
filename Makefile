build :
	npm i --production
	sam build
	rm -rf .aws-sam/build/TriggerCloudFormationDriftDetection/node_modules
	rm -rf .aws-sam/build/TriggerCloudFormationDriftDetection/README.md
	sam package \
		--template-file .aws-sam/build/template.yaml \
		--s3-bucket "$(s3-bucket)" \
		--s3-prefix cloudformation-drift-detection \
		--output-template-file .aws-sam/cloudformation-packaged.yaml
	aws s3 cp .aws-sam/cloudformation-packaged.yaml "s3://$(s3-bucket)/cloudformation-drift-detection/template.yaml"
clean :
	rm -rf .aws-sam
