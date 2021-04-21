# Requirements taken from
# https://github.com/ansible/ansible/blob/devel/README.md and
# https://github.com/ansible/ansible/blob/devel/hacking/README.md

cd ansible
git submodule update --init --recursive
cd -
virtualenv ansible_venv
source ansible_venv/bin/activate
pip install pyyaml jinja2 nose passlib pycrypto
cd ansible && source ./hacking/env-setup && cd -
