import { Button } from '@/components/ui/button'

export default async function Home() {
  return (
    <div className='p-10'>
      <h1 className='text-xl font-black'>FPC - Funnel Page Creation</h1>

      <Button>Click me</Button>

      <div className="w-20 h-20 bg-primary"></div>
      <div className="w-20 h-20 bg-secondary"></div>
      <div className="w-20 h-20 bg-martinique"></div>
      <div className="w-20 h-20 bg-medium-red-violet"></div>
      <div className="w-20 h-20 bg-storm-dust"></div>
    </div>
  )
}
