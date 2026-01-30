# Database Models

This document describes the data models used in the store-system database. For setup and configuration instructions, see [database.md](./database.md).

## Schema Organization

Models are organized into modular schema files located in `/packages/db/prisma/schema/`:

- **auth.prisma**: User authentication and access control models
- **hr.prisma**: Human resources and employee management models
- **sales.prisma**: Sales transactions and payment models
- **inventory.prisma**: Product inventory and warehouse logistics models

## Application Usage

| App | Main Focus | Key Models |
|-----|------------|------------|
| Admin Panel | Human Resources and Control | Employee, Payroll, Schedule |
| Store Front (POS) | Quick Transactions | Sale, Product, Payment |
| Warehouse App | Logistics and Stock | Product, StockLog, Transfer |



### Entity-Relationship Diagrams (ERD)
To view the detailed visual structure of each module, check the technical diagrams:

* **Authentication**: [View auth.mermaid](./database/auth.mermaid)
* **Inventory**: [View inventory.mermaid](./database/inventory.mermaid)
* **Sales**: [View sales.mermaid](./database/sales.mermaid)