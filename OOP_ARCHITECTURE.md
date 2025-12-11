# Class-Based OOP Architecture

## Overview

This project has been refactored to use a class-based Object-Oriented Programming (OOP) architecture. The new structure follows industry best practices with clear separation of concerns across three main layers:

1. **Repository Layer** - Database operations
2. **Service Layer** - Business logic
3. **Controller Layer** - HTTP request/response handling

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP Request
                  ▼
┌─────────────────────────────────────────────────────────┐
│                  Controller Layer                       │
│  (Handles HTTP requests, validation, response formatting)│
│  - UserController                                       │
│  - CampaignController                                   │
│  - AuthController                                       │
└─────────────────┬───────────────────────────────────────┘
                  │ Calls service methods
                  ▼
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                         │
│  (Business logic, validation, orchestration)            │
│  - UserService                                          │
│  - CampaignService                                      │
│  - AuthService                                          │
└─────────────────┬───────────────────────────────────────┘
                  │ Calls repository methods
                  ▼
┌─────────────────────────────────────────────────────────┐
│                 Repository Layer                        │
│  (Database operations, queries)                         │
│  - UserRepository                                       │
│  - CampaignRepository                                   │
└─────────────────┬───────────────────────────────────────┘
                  │ Interacts with
                  ▼
┌─────────────────────────────────────────────────────────┐
│                    Database Models                      │
│  (Sequelize models)                                     │
│  - User                                                 │
│  - Campaign                                             │
│  - CampaignUsers                                        │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── core/                      # Base classes
│   ├── BaseRepository.js     # Base repository with common DB operations
│   ├── BaseService.js        # Base service with common business logic
│   └── BaseController.js     # Base controller with common HTTP handling
│
├── repositories/             # Data access layer
│   ├── UserRepository.js
│   ├── CampaignRepository.js
│   └── ...
│
├── services/                 # Business logic layer
│   ├── UserService.js
│   ├── CampaignService.js
│   ├── AuthService.js
│   └── ...
│
├── controllers/              # HTTP request handling
│   ├── UserController.class.js
│   ├── CampaignController.class.js
│   ├── AuthController.class.js
│   └── ... (old functional controllers)
│
├── routes/                   # Route definitions
│   ├── userRoutes.class.js
│   ├── campaignRoutes.class.js
│   ├── authRoutes.class.js
│   └── ... (old routes)
│
├── models/                   # Database models (unchanged)
├── middlewares/              # Express middlewares (unchanged)
└── utils/                    # Utility functions (unchanged)
```

## Base Classes

### BaseRepository

Provides common database operations for all repositories:

- `findAll(options)` - Find all records
- `findById(id)` - Find by primary key
- `findOne(options)` - Find one record
- `create(data)` - Create new record
- `update(id, data)` - Update record
- `delete(id)` - Delete record
- `buildWhereClause(filters)` - Build query filters
- `buildOrderClause(sort, order)` - Build sorting

### BaseService

Provides common business logic operations:

- `getAll(filters, options)` - Get all with filters
- `getById(id)` - Get by ID
- `create(data)` - Create new
- `update(id, data)` - Update
- `delete(id)` - Delete
- `validateRequired(data, fields)` - Validate required fields

### BaseController

Provides common HTTP handling:

- `asyncHandler(fn)` - Async error handling
- `sendSuccess(res, data, status)` - Success response
- `sendError(res, message, status)` - Error response
- `getAll()` - GET all endpoint
- `getById()` - GET by ID endpoint
- `create()` - POST endpoint
- `update()` - PUT endpoint
- `delete()` - DELETE endpoint

## Examples

### 1. Creating a New Repository

```javascript
import BaseRepository from "../core/BaseRepository.js";
import YourModel from "../models/YourModel.js";

class YourRepository extends BaseRepository {
  constructor() {
    super(YourModel);
  }

  // Add custom queries specific to this model
  async findByCustomField(value) {
    return await this.findAll({
      where: { custom_field: value }
    });
  }
}

export default new YourRepository();
```

### 2. Creating a New Service

```javascript
import BaseService from "../core/BaseService.js";
import YourRepository from "../repositories/YourRepository.js";

class YourService extends BaseService {
  constructor() {
    super(YourRepository);
  }

  // Add business logic specific to this domain
  async customBusinessLogic(data) {
    // Validate
    this.validateRequired(data, ["field1", "field2"]);
    
    // Process
    const processed = await this.someProcessing(data);
    
    // Save
    return await this.repository.create(processed);
  }
}

export default new YourService();
```

### 3. Creating a New Controller

```javascript
import BaseController from "../core/BaseController.js";
import YourService from "../services/YourService.js";

class YourController extends BaseController {
  constructor() {
    super(YourService);
  }

  // Add custom endpoints
  customEndpoint = this.asyncHandler(async (req, res) => {
    const result = await this.service.customBusinessLogic(req.body);
    this.sendSuccess(res, result);
  });
}

export default new YourController();
```

### 4. Using in Routes

```javascript
import express from "express";
import YourController from "../controllers/YourController.class.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, YourController.getAll);
router.get("/:id", authMiddleware, YourController.getById);
router.post("/", authMiddleware, YourController.create);
router.put("/:id", authMiddleware, YourController.update);
router.delete("/:id", authMiddleware, YourController.delete);

// Custom endpoint
router.post("/custom", authMiddleware, YourController.customEndpoint);

export default router;
```

## Benefits of This Architecture

### 1. **Separation of Concerns**
- Each layer has a single responsibility
- Easy to understand and maintain
- Changes in one layer don't affect others

### 2. **Code Reusability**
- Base classes eliminate code duplication
- Common operations inherited from base classes
- Focus on domain-specific logic

### 3. **Testability**
- Easy to unit test each layer independently
- Mock dependencies between layers
- Test business logic without HTTP

### 4. **Maintainability**
- Clear structure makes it easy to find code
- New developers can understand quickly
- Consistent patterns across the codebase

### 5. **Scalability**
- Easy to add new features
- Can swap implementations (e.g., different databases)
- Support for microservices architecture

## Migration Guide

### Phase 1: Completed ✅
- Created base classes (Repository, Service, Controller)
- Migrated User module
- Migrated Campaign module
- Migrated Auth module

### Phase 2: To Do
Migrate remaining modules:
- [ ] Student
- [ ] CampaignUsers
- [ ] Review
- [ ] Notification
- [ ] ChatRoom
- [ ] ChatMessage
- [ ] Payment
- [ ] Withdrawal
- [ ] Transaction

### How to Migrate a Module

1. **Create Repository** (`src/repositories/YourRepository.js`)
   - Extend BaseRepository
   - Add model-specific queries

2. **Create Service** (`src/services/YourService.js`)
   - Extend BaseService
   - Move business logic from old controller
   - Add validations and orchestration

3. **Create Controller** (`src/controllers/YourController.class.js`)
   - Extend BaseController
   - Keep only HTTP handling
   - Use service for business logic

4. **Update Routes** (`src/routes/yourRoutes.class.js`)
   - Import new class-based controller
   - Update route handlers

5. **Test**
   - Test all endpoints
   - Ensure same behavior as old version

6. **Switch**
   - Update `src/routes/index.js` to use new routes
   - Remove old controller file

## Testing

### Unit Testing Services

```javascript
import YourService from "../services/YourService.js";

describe("YourService", () => {
  test("should create record", async () => {
    const data = { field1: "value1" };
    const result = await YourService.create(data);
    expect(result).toBeDefined();
  });
});
```

### Integration Testing Controllers

```javascript
import request from "supertest";
import app from "../app.js";

describe("POST /api/v1/your-resource", () => {
  test("should create new resource", async () => {
    const response = await request(app)
      .post("/api/v1/your-resource")
      .set("Authorization", `Bearer ${token}`)
      .send({ field1: "value1" });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

## Best Practices

1. **Keep Controllers Thin**
   - Only handle HTTP request/response
   - Delegate business logic to services

2. **Keep Services Focused**
   - One service per domain entity
   - Complex operations in separate services

3. **Repository Per Model**
   - One repository per database model
   - All queries in repository, not in service

4. **Use Dependency Injection**
   - Pass dependencies in constructor
   - Makes testing easier

5. **Error Handling**
   - Use try-catch in asyncHandler
   - Throw descriptive errors
   - Let middleware handle HTTP errors

6. **Validation**
   - Validate in service layer
   - Use validateRequired helper
   - Add custom validators as needed

## Comparison: Old vs New

### Old Functional Style
```javascript
// controller/userController.js
const getAll = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
};

export default { getAll };
```

### New Class-Based Style
```javascript
// repositories/UserRepository.js
class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }
}

// services/UserService.js
class UserService extends BaseService {
  constructor() {
    super(UserRepository);
  }
}

// controllers/UserController.class.js
class UserController extends BaseController {
  constructor() {
    super(UserService);
  }
  // getAll() inherited from BaseController
}
```

## Next Steps

1. ✅ Complete base architecture
2. ✅ Migrate User, Campaign, Auth modules
3. ⏳ Migrate remaining modules one by one
4. ⏳ Add unit tests for services
5. ⏳ Add integration tests for controllers
6. ⏳ Update API documentation
7. ⏳ Remove old functional controllers

## Questions?

For questions about the new architecture:
1. Check this README
2. Look at completed examples (User, Campaign, Auth)
3. Review base classes in `src/core/`

---

**Note**: Both old and new architectures coexist during migration. Old routes still work. Switch to new routes by updating `src/routes/index.js` when ready.
