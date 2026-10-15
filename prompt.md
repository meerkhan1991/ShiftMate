# ShiftMate – Smart Manpower Scheduling & Temporary Staff Hiring Platform

## User Request & Specification

Build a modern, responsive, functional web application called **ShiftMate – Smart Manpower Scheduling & Temporary Staff Hiring Platform**.

The application is designed for small and medium-sized businesses in Singapore, especially F&B stalls, retail kiosks, small shops and service businesses.

The application must provide two primary services:
1. **Staff Scheduling:** Allow companies to schedule their existing employees based on tasks, shift durations and required headcount.
2. **Temporary Staff Hiring:** Allow companies to hire temporary workers for specific stalls, dates and time periods, especially when facing last-minute manpower shortages.

The application must be interactive and functional, not merely a static UI mockup.

## Technology Requirements
- Use React with TypeScript.
- Use Tailwind CSS for styling.
- Create a responsive interface for desktop and mobile.
- Use Lucide icons.
- Use a modern dashboard layout with sidebar navigation.
- Use Singapore timezone (Asia/Singapore).
- Use SGD for all monetary values.
- Use 24-hour time formatting.
- Use a persistent database when supported by the environment.
- If no database is configured, use localStorage for a functional prototype and clearly label it as demo storage.
- Do not require paid APIs for the initial MVP.
- Include realistic sample data for demonstration.

## Module 1: Company and Stall Management
Create a company management page.
Companies should be able to:
- Register their company name.
- Add and manage stalls or outlets.
- Enter stall name and location.
- Set operating hours.
- View employees assigned to each stall.
- Add, edit and delete stall information.

Each company can have multiple stalls, but the initial demonstration should focus on one company operating one stall.
Example:
- Company: ABC Food Pte Ltd
- Stall: ABC Chicken Rice
- Location: Tampines, Singapore
- Operating Hours: 09:00–21:00

## Module 2: Staff Scheduling
Create an interactive staff scheduling module.
The company administrator should be able to:
- Select company and stall.
- Create tasks.
- Enter task descriptions.
- Select task date.
- Set shift start time and end time.
- Specify the number of staff required.
- Assign available existing employees.
- View assigned and unassigned staff.
- Edit or cancel shifts.
- Create recurring shifts.
- View schedules in daily, weekly and monthly formats.

Example task:
- Task: Cashier
- Date: 15 October 2026
- Start Time: 09:00
- End Time: 17:00
- Required Headcount: 3
- Assigned Employees: 1
- Manpower Shortage: 2

Automatically calculate:
`Manpower Shortage = Maximum of (Required Headcount - Confirmed Assigned Staff, 0)`

Display staffing status using:
- Green: Fully staffed
- Orange: Partially staffed
- Red: No staff assigned

Prevent overlapping assignments for the same worker.
Allow shifts to be assigned to both permanent employees and confirmed temporary workers.

## Module 3: Temporary Staff Hiring
Create a temporary staff hiring page.
Companies should be able to:
- Select company.
- Select stall.
- Select job role or task.
- Select hiring start date and end date.
- Select daily start and end times.
- Specify required headcount.
- Specify hourly salary.
- Add job requirements.
- Indicate whether the request is urgent.
- Submit hiring requests.

Support both single-day and multi-day hiring.
For multi-day requests, allow users to select applicable working days.
The application should calculate the estimated labour cost.
Allow employers to view suitable temporary workers based on:
- Availability
- Job skills
- Preferred working location
- Hourly rate
- Existing shift commitments
Do not automatically confirm bookings without worker acceptance.

## Module 4: Temporary Worker Portal
Create a separate interface for temporary workers.
Temporary workers should be able to:
- Register a worker profile.
- Enter their name and contact details.
- Select job skills.
- Set preferred work locations.
- Enter preferred hourly rates.
- Update availability.
- Browse available temporary jobs.
- Accept or decline job offers.
- View upcoming confirmed assignments.
- View estimated earnings.

For demonstration, create sample temporary worker profiles with different availability schedules and skills.

## Module 5: Emergency Replacement System
Create a feature called **Find Emergency Replacement**.
When an existing employee reports MC, absence or inability to attend a shift:
1. The company administrator selects the affected shift.
2. Marks the employee as unavailable.
3. The system recalculates the manpower shortage.
4. The system identifies available temporary workers.
5. The administrator can send replacement requests.
6. Workers can accept or decline.
7. Once accepted, the worker is assigned to the shift.
8. The dashboard updates the confirmed headcount.

Include a prominent button labelled "Find Replacement".
Simulate notifications within the application.

## Module 6: Salary and Labour Cost Calculator
Create a salary estimation module.
Calculate estimated labour cost based on:
- Number of workers
- Hourly rate
- Shift duration
- Number of working days
- Unpaid break duration, if applicable

Display:
- Estimated total working hours
- Estimated labour cost
- Cost per worker
- Total estimated cost
- Platform service fees separately (clearly labeled as estimates)

## Module 7: Dashboard and Reporting
Create a dashboard with summary cards:
- Total Active Stalls
- Today's Scheduled Shifts
- Total Required Headcount
- Confirmed Assigned Workers
- Manpower Shortages
- Pending Temporary Staff Requests
- Estimated Labour Cost

Include:
- Upcoming shifts
- Staff shortage alerts
- Pending worker acceptances
- Recent hiring requests
- Weekly staffing overview
- Simple charts showing manpower requirements versus confirmed staffing

## Module 8: User Roles
Provide three user roles with an interactive switcher:
1. **Company Administrator**
2. **Internal Employee**
3. **Temporary Worker**

## Sidebar Menu:
1. Dashboard
2. Companies & Stalls
3. Staff Scheduling
4. Temporary Staff Hiring
5. Worker Directory
6. Emergency Replacement
7. Salary Calculator
8. Reports
9. Settings

## Initial Demo Scenario:
- Company: ABC Food Pte Ltd
- Stall: ABC Chicken Rice
- Date: 15 October 2026
- Task: Service Crew
- Shift: 12:00–20:00
- Required Headcount: 4
- Existing Staff Assigned: 2
- Manpower Shortage: 2
- Clicking "Find Replacement" displays available temp workers; hiring requests can be sent; temporary worker can accept in their portal; schedule updates to Fully Staffed (Green) and shortage alert is resolved.

---

## Subsequent User Request:
```
git push https://<GITHUB_PERSONAL_ACCESS_TOKEN>@github.com/meerkhan1991/ShiftMate.git

-store this in /api folder (project root level) not the src folder
-include /health.ts and /shiftmate.ts within that sub folder
```

