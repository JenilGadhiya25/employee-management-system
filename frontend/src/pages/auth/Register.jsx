// Register is merged into Login page with a slider toggle
// This file redirects to /login
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
const Register = () => { const n = useNavigate(); useEffect(() => n('/login', { replace: true }), []); return null }
export default Register
