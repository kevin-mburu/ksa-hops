import dynamic from 'next/dynamic'
const RegisterApp = dynamic(() => import('./RegisterApp'), { ssr: false })
export default function RegisterPage() { return <RegisterApp /> }
