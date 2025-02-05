# PoliStudio

PoliStudio is a campaign management tool designed to help organize and manage various aspects of political campaigns. This application features donor tracking, analytics & reporting, phone banking management, and more.

## Table of Contents

- [Features](#features)
- [Directory Structure](#directory-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [API Endpoints](#api-endpoints)
- [Future Improvements](#future-improvements)
- [License](#license)

## Features

- **Donor Tracking:**  
  - Manage donor records.
  - View individual donor details including contribution amounts and donation dates.
  - Edit and delete donor information.
  
- **Analytics & Reporting:**  
  - Generate reports that display total donations, top donors, and donation trends over time using dynamically updated charts.
  
- **Phone Banking:**  
  - Manage campaigns, view campaign statistics, and track call outcomes.
  
- **Other Features:**  
  - AI Copywriting support.
  - Voter list management.
  - Door knocking and volunteer management.

## Directory Structure

```
.
├── backend
│   ├── main.py                 # FastAPI application entrypoint
│   ├── models.py               # SQLAlchemy models
│   ├── database.py             # Database connection and configuration
│   └── routers
│       ├── donors.py           # Endpoints for donor CRUD and CSV import
│       └── donations.py        # Endpoint for generating donations analytics report
├── frontend
│   └── polistudio-frontend
│       ├── src
│       │   ├── components
│       │   │   ├── DonorTracking.jsx        # Donor list with analytics and trends chart
│       │   │   ├── PhoneBankingStats.jsx      # Phone banking campaign stats
│       │   │   └── Dashboard.jsx              # Dashboard with application features
│       │   └── styles
│       │       └── DonorTracking.css          # Styles for donor tracking components
│       └── package.json                        # Frontend dependencies and scripts
└── README.md
```

## Backend Setup

The backend is built with FastAPI and uses SQLAlchemy for database interactions.

1. **Install Dependencies:**  
   Create a virtual environment and install the required packages:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Database Configuration:**  
   Ensure that your database is set up and configured (using your preferred database provider). The models are created automatically on startup in `backend/main.py` using:

   ```python
   Base.metadata.create_all(bind=engine)
   ```

3. **Run the Backend:**  
   Start the FastAPI server with uvicorn:

   ```bash
   uvicorn backend.main:app --reload
   ```

   The backend API will be accessible at [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Frontend Setup

The frontend is built using React and utilizes Chart.js for data visualization.

1. **Install Dependencies:**  
   Navigate to the frontend directory and install dependencies:

   ```bash
   cd frontend/polistudio-frontend
   npm install
   ```

2. **Run the Frontend:**  
   Start the development server:

   ```bash
   npm start
   ```

   The application should be accessible at [http://localhost:3000](http://localhost:3000).

## API Endpoints

### Donations & Analytics

- **GET /donations/report**  
  Returns an analytics report containing:
  
  - `total_donations`: Sum of all recorded donations.
  - `top_donors`: List of donor objects with the highest contributions.
  - `trends`: An object with two arrays:
    - `labels`: A sorted list of month identifiers (formatted as "YYYY-MM").
    - `data`: Total donations corresponding to each month.

  Example response:

  ```json
  {
    "total_donations": 4500,
    "top_donors": [
      { "name": "Alice", "total": 1500 },
      { "name": "Bob", "total": 1200 }
    ],
    "trends": {
      "labels": ["2023-09", "2023-10", "2023-11"],
      "data": [1000, 1500, 2000]
    }
  }
  ```

### Donor Management

- **GET /donors**  
  Retrieve a list of all donors.
  
- **POST /donors**  
  Create a new donor.
  
- **PUT /donors/{donor_id}**  
  Update an existing donor.
  
- **DELETE /donors/{donor_id}**  
  Delete a donor from the database.

Additional endpoints are available to support CSV import/export for donor data.

## Future Improvements

- **Real-Time Data Updates:**  
  Integrate WebSockets to push real-time updates of analytics charts.
  
- **Enhanced Data Aggregation:**  
  Refine donation trends aggregation to support more granular filtering (daily, weekly, etc.).
  
- **User Authentication & Security:**  
  Implement authentication for securing API endpoints and restricting access.
  
- **Comprehensive Testing:**  
  Add unit and integration tests for both backend and frontend components.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
