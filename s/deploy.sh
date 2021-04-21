
export ENV=production && ansible-playbook ./deploy/playbook.yml --limit "$ENV" --tags "deploy"
