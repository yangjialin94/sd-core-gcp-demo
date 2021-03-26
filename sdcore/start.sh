#!/bin/bash -e

# go to project root and install dependencies
pipenv install

# reset db
pipenv run python3 manage.py flush --no-input
pipenv run python3 manage.py makemigrations api
pipenv run python3 manage.py migrate
pipenv run python3 manage.py loaddata fixtures.json

# create users
echo "from django.contrib.auth.models import User; User.objects.create_superuser('admin', 'admin@example.com', '1234qwerasdf')" | pipenv run python3 manage.py shell
echo "Created super user with username: \"admin\" and password: \"1234qwerasdf\""
echo "from django.contrib.auth.models import User; User.objects.create_user(username='txcoding', email='txcoding@example.com', password='1234qwerasdf', first_name='Tenx', last_name='Coding', is_staff=True)" | pipenv run python3 manage.py shell
echo "Created user with username: \"txcoding\" and password: \"1234qwerasdf\""
echo "from django.contrib.auth.models import User; User.objects.create_user(username='mandy', email='mandy@example.com', password='1234qwerasdf', first_name='Andy', last_name='Mitchell')" | pipenv run python3 manage.py shell
echo "Created user with username: \"mandy\" and password: \"1234qwerasdf\""
echo "from django.contrib.auth.models import User; User.objects.create_user(username='wben', email='wben@example.com', password='1234qwerasdf', first_name='Ben', last_name='Williams')" | pipenv run python3 manage.py shell
echo "Created user with username: \"wben\" and password: \"1234qwerasdf\""
echo "from django.contrib.auth.models import User; User.objects.create_user(username='sdenise', email='sdenise@example.com', password='1234qwerasdf', first_name='Denise', last_name='Smith')" | pipenv run python3 manage.py shell
echo "Created user with username: \"sdenise\" and password: \"1234qwerasdf\""

# run server
case $(uname -s) in
    Linux*) OPEN_CMD=xdg-open;;
    Darwin*) OPEN_CMD=open;;
    *) OPEN_CMD=echo;;
esac
# run server
pipenv run python3 manage.py runserver &
sleep 2
${OPEN_CMD} http://localhost:8000/
${OPEN_CMD} http://localhost:8000/admin
