# Migrations Guide

## Creating a New Migration

To create a new empty migration:
```bash
npm run migration:create src/migrations/DescriptiveName
```

To auto-generate a migration based on entity changes:
```bash
npm run migration:generate src/migrations/DescriptiveName
```

## Running Migrations

To run pending migrations:
```bash
npm run migration:run
```

## Reverting Migrations

To revert the last migration:
```bash
npm run migration:revert
```

## Viewing Migration Status

To see which migrations have been run:
```bash
npm run migration:show
```

## Important Notes

- Always review generated migrations before running them
- Test migrations in a development environment first
- Keep `synchronize: false` in production (already configured)
- Migrations run in the order they were created based on timestamp
