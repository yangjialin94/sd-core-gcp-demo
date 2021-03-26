# sdcore

A SD Core application front-end built with Django and UI5.

# sdcore/frontend

A Django applicaiton that contains all the UI5 files.

# sdcore/api

A Django application that helps "frontend" and SAP communicate.
It intercepts the AJAX calls from "frontend", evaluate, then send it to SAP.
It intercepts the return calls from SAP, parse it, then sent it to "frontend".

# sdcore/user

A Django application that used for user registration and authentication.

## How to run the application

```
$ ./cloud_sql_proxy -instances="test-10xcoding-devops:us-central1:sdcore-instance"=tcp:5432
```

```
$ cd ~/Desktop
$ git clone https://github.com/10xcoding/sd_core_gcp.git
$ cd sd_core_gcp/sdcore/sdcore
$ touch .env
$ echo DATABASE_USER=sdcore-user > .env
$ echo DATABASE_PASSWORD=6jIwwzyHreGpzk0B >> .env
$ cd ..
$ ./start.sh
```

```
kill port 8000: $ sudo lsof -t -i tcp:8000 | xargs kill -9
```

### URLs

| Page           | URL                          |
| -------------- | ---------------------------- |
| Admin          | http://127.0.0.1:8000/admin/ |
| Sales Overview | http://127.0.0.1:8000        |

### Users

| Username | Password     | Is Staff |
| -------- | ------------ | -------- |
| admin    | 1234qwerasdf | Y        |
| txcoding | 1234qwerasdf | Y        |
| mandy    | 1234qwerasdf | N        |
| wben     | 1234qwerasdf | N        |
| sdenise  | 1234qwerasdf | N        |

# Author

- **[Jialin Yang](https://github.com/yangjialin94)** - [10xCoding](10xcoding.com)
