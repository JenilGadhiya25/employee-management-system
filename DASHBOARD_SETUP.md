# Real-Time Team Dashboard Setup Guide

## ✅ What's Been Implemented

### Backend Updates
1. **User Model** - Added `managerId` field to establish team relationships
2. **Dashboard Controller** - Updated all endpoints with role-based filtering:
   - **Admin** sees all employees' data
   - **Manager** sees only their team members (employees with their ID as managerId)
   - **Employee** sees only their own data
3. **Dashboard Routes** - Updated to allow all authenticated users (admin, manager, employee)

### Frontend Components

#### Admin Dashboard (`frontend/src/pages/admin/Dashboard.jsx`)
- 6 stat cards showing team metrics
- 4 interactive charts:
  - Monthly attendance bar chart
  - Team productivity line chart
  - Task status pie chart
  - Task completion rate by employee
- Team performance table
- Month/year filters
- Auto-refresh every 30 seconds

#### Employee Dashboard (`frontend/src/pages/employee/Dashboard.jsx`)
- Personal stats (attendance, productivity, tasks)
- Individual charts showing their data
- Task summary breakdown
- Hours worked analytics

### Services
- Updated `dashboardService.js` to properly pass month and year parameters
- Updated `Analytics.jsx` to use the new service format

## 🚀 How to Use

### 1. Start the Backend
```bash
cd backend
npm install
npm start
```
Backend runs on `http://localhost:5000`

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`

### 3. Login with Different Roles

**Admin Account:**
- Email: admin@example.com
- Password: password123
- Access: `/admin/dashboard` - sees all employees

**Manager Account:**
- Email: manager@example.com
- Password: password123
- Access: `/admin/dashboard` - sees only their team

**Employee Account:**
- Email: employee@example.com
- Password: password123
- Access: `/employee/dashboard` - sees only their data

## 📊 Dashboard Features

### Real-Time Updates
- Data refreshes every 30 seconds automatically
- No page reload needed
- Charts update smoothly

### Role-Based Access
- **Admin**: Full visibility of all team members
- **Manager**: Only sees employees assigned to them (via managerId)
- **Employee**: Only sees their own metrics

### Data Displayed
- **Attendance**: Present days, absent days, leave days, total hours
- **Productivity**: Average productivity scores
- **Tasks**: Completed, pending, in-progress, cancelled
- **Performance**: Individual and team metrics

## 🔧 Configuration

### Backend Port
- Default: `5000`
- Configure in `.env` file: `PORT=5000`

### Frontend Proxy
- Configured in `vite.config.js`
- Points to `http://localhost:5000`

### Database
- Ensure MongoDB is running
- Connection string in `backend/.env`

## 📝 Database Setup

### Add Manager Relationship
To set up manager-employee relationships, update the User model:

```javascript
// In backend/src/models/User.js
managerId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  default: null,
}
```

Then update employees with their manager's ID:
```javascript
// Example: Set manager for an employee
db.users.updateOne(
  { email: 'employee@example.com' },
  { $set: { managerId: ObjectId('manager_id_here') } }
)
```

## 🎨 Styling

- Uses Recharts for charts
- Bootstrap 5 for layout
- Custom CSS in `Dashboard.css`
- Responsive design for mobile and desktop

## 🐛 Troubleshooting

### Dashboard not loading?
1. Check backend is running on port 5000
2. Verify token is stored in localStorage
3. Check browser console for errors

### Charts not showing?
1. Ensure data exists in database
2. Check network tab for API responses
3. Verify month/year filters are set correctly

### Role-based filtering not working?
1. Ensure user has correct role in database
2. For managers, verify managerId is set on employees
3. Check auth middleware is properly extracting user

## 📱 Mobile Responsive
- Dashboard adapts to mobile screens
- Charts stack vertically on small screens
- Touch-friendly controls

## 🔐 Security
- JWT token authentication
- Role-based access control
- Protected routes
- Secure API endpoints

## 📈 Performance
- 30-second auto-refresh interval
- Efficient database queries with aggregation
- Optimized chart rendering
- Lazy loading of components

---

**Status**: ✅ Ready to use
**Last Updated**: April 27, 2026
