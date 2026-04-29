# MySQL to AWS RDS Migration Notes

This task demonstrates migration of existing MySQL records to AWS RDS MySQL.

## Export from Existing MySQL Database

```bash
mysqldump -u root -p internship_management > internship_management_backup.sql
```

## Import into AWS RDS MySQL

```bash
mysql -h your-rds-endpoint.amazonaws.com -u admin -p internship_management < internship_management_backup.sql
```

## This Project

For the internship task, the database migration is represented by:

- `database/schema.sql`
- `database/seed.sql`

These SQL files create the cloud database structure and import sample existing intern records into AWS RDS.
