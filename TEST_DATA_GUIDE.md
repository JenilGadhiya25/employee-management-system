# 🎯 Test Data Guide - Employee Management System

## ✅ Data Created Successfully

Your application now has complete test data for all three roles with real information:

### 📊 Data Summary
- **1 Admin User**
- **2 Managers** (Engineering & Sales)
- **5 Employees** (3 under Engineering Manager, 2 under Sales Manager)
- **150+ Attendance Records** (30 days × 5 employees)
- **6 Tasks** (with different statuses: completed, in-progress, pending)
- **3 Leave Records** (approved and pending)

---

## 🔐 Login Credentials

### ADMIN (Full Access)
```
Email: admin@company.com
Password: 123456
Role: Admin
```
**What Admin Can See:**
- All employees across all departments
- All attendance records
- All tasks
- All leave requests
- Complete analytics and reports
- Team performance metrics

---

### MANAGER 1 - Engineering (Team Lead)
```
Email: rajesh@company.com
Password: 123456
Role: Manager
Department: Engineering
```
**Team Members:**
- Amit Patel (Senior Developer)
- Neha Singh (Junior Developer)
- Vikram Desai (QA Engineer)

**What Manager Can See:**
- Only their team's data
- Team attendance records
- Team tasks and assignments
- Team leave requests
- Team performance metrics

---

### MANAGER 2 - Sales (Team Lead)
```
Email: priya@company.com
Password: 123456
Role: Manager
Department: Sales
```
**Team Members:**
- Sneha Gupta (Sales Executive)
- Rohan Verma (Sales Executive)

**What Manager Can See:**
- Only their team's data
- Team attendance records
- Team tasks and assignments
- Team leave requests
- Team performance metrics

---

## 👥 Employees

### Engineering Team
1. **Amit Patel** (Senior Developer)
   - Email: amit@company.com
   - Password: 123456
   - Manager: Rajesh Kumar

2. **Neha Singh** (Junior Developer)
   - Email: neha@company.com
   - Password: 123456
   - Manager: Rajesh Kumar

3. **Vikram Desai** (QA Engineer)
   - Email: vikram@company.com
   - Password: 123456
   - Manager: Rajesh Kumar

### Sales Team
4. **Sneha Gupta** (Sales Executive)
   - Email: sneha@company.com
   - Password: 123456
   - Manager: Priya Sharma

5. **Rohan Verma** (Sales Executive)
   - Email: rohan@company.com
   - Password: 123456
   - Manager: Priya Sharma

**What Employees Can See:**
- Only their own data
- Their attendance records
- Their assigned tasks
- Their leave requests
- Their personal performance metrics

---

## 📋 Sample Data Details

### Attendance Records
- **30 days of data** for each employee
- **Clock-in times:** 9:00 AM - 9:30 AM
- **Clock-out times:** 5:00 PM - 7:00 PM
- **Status:** Present, Half-day, or Absent (randomly distributed)
- **Total Hours:** Calculated from clock-in/out times

### Tasks
1. **Fix Login Bug** - Amit Patel (Completed)
2. **Design Dashboard** - Neha Singh (In Progress)
3. **Write Unit Tests** - Vikram Desai (Pending)
4. **Client Meeting Prep** - Sneha Gupta (Completed)
5. **Sales Report** - Rohan Verma (In Progress)
6. **Database Optimization** - Amit Patel (Pending)

### Leave Records
1. **Amit Patel** - 3 days (Approved)
2. **Neha Singh** - 3 days (Pending)
3. **Sneha Gupta** - 3 days (Approved)

---

## 🚀 How to Test

### Step 1: Open Application
```
Frontend: http://localhost:3001
Backend: http://localhost:5001
```

### Step 2: Test Admin Dashboard
1. Login with `admin@company.com` / `123456`
2. You should see:
   - All employees (8 total)
   - All attendance data
   - All tasks
   - Complete analytics

### Step 3: Test Manager Dashboard
1. Login with `rajesh@company.com` / `123456`
2. You should see:
   - Only 3 team members (Amit, Neha, Vikram)
   - Only their attendance data
   - Only their tasks
   - Team-specific analytics

### Step 4: Test Employee Dashboard
1. Login with `amit@company.com` / `123456`
2. You should see:
   - Only your own data
   - Your attendance calendar
   - Your assigned tasks
   - Your personal metrics

---

## ✨ Features to Test

### Dashboard
- [ ] Stat cards showing correct numbers
- [ ] Charts displaying real data
- [ ] Calendar showing attendance
- [ ] Role-based data filtering

### Attendance
- [ ] Calendar view with 30 days of data
- [ ] Clock-in/out times visible
- [ ] Leave quota tracking
- [ ] Status indicators (Present/Absent/Half-day)

### Tasks
- [ ] Task list with assignments
- [ ] Status filtering (Completed/In Progress/Pending)
- [ ] Priority indicators
- [ ] Due dates

### Leave Management
- [ ] Leave requests visible
- [ ] Status tracking (Approved/Pending)
- [ ] Leave quota calculation
- [ ] Leave history

### Profile
- [ ] Employee information displayed
- [ ] Department and designation shown
- [ ] Manager assignment visible
- [ ] Contact details

---

## 🔄 Role-Based Access Control

| Feature | Admin | Manager | Employee |
|---------|-------|---------|----------|
| View All Employees | ✅ | ❌ | ❌ |
| View Team Only | ✅ | ✅ | ❌ |
| View Self Only | ✅ | ✅ | ✅ |
| Manage Tasks | ✅ | ✅ | ✅ |
| Approve Leaves | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ❌ | ❌ |

---

## 📝 Notes

- All passwords are set to `123456` for easy testing
- Attendance data spans the last 30 days
- Sundays are excluded from attendance records
- Each employee has realistic work hours (9 AM - 7 PM)
- Tasks have varied priorities and statuses
- Leave records include both approved and pending requests

---

## 🎉 Ready to Test!

Your application is now fully populated with realistic test data. You can:
1. Test role-based access control
2. Verify data filtering works correctly
3. Check dashboard calculations
4. Test all features with real data

**Happy Testing! 🚀**
