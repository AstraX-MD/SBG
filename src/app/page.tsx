import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, Zap, Database, Terminal, Cpu, Clock, Activity, Signal } from "lucide-react"

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">
            SBG ENGINE <span className="text-sm font-body text-secondary ml-2">v1.0.0</span>
          </h1>
          <p className="text-muted-foreground mt-1">Small But Genius &mdash; Presence Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 border-primary/50 text-primary flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-subtle" />
            SOCKET ACTIVE
          </Badge>
          <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
            <Signal className="w-4 h-4 text-primary" />
            <span className="text-xs font-code">6.7.22</span>
          </div>
        </div>
      </header>

      {/* Grid Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="Uptime"
          value="99.9%"
          icon={<Clock className="w-5 h-5 text-primary" />}
          description="Service continuity"
        />
        <StatusCard
          title="Sessions"
          value="1 Active"
          icon={<Zap className="w-5 h-5 text-primary" />}
          description="Handshake established"
        />
        <StatusCard
          title="Database"
          value="Sync Ready"
          icon={<Database className="w-5 h-5 text-primary" />}
          description="Zero-hardcode mode"
        />
        <StatusCard
          title="Memory"
          value="42%"
          icon={<Cpu className="w-5 h-5 text-primary" />}
          description="Resource janitor idle"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Connection Logs */}
        <Card className="lg:col-span-2 bg-card border-border shadow-2xl">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 font-headline text-primary">
              <Terminal className="w-5 h-5" />
              REAL-TIME LOGS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-black/40 font-code text-xs p-6 space-y-2 h-[400px] overflow-y-auto">
              <LogLine time="10:45:01" type="SYSTEM" message="SBG Engine initialization started..." />
              <LogLine time="10:45:03" type="AUTH" message="Base64 session handshake detected: SBG~XXXX" />
              <LogLine time="10:45:05" type="DATABASE" message="Connected to MongoDB: Cluster0" />
              <LogLine time="10:45:07" type="LOADER" message="Plugins loaded: general(3), events(5), anti(2)" />
              <LogLine time="10:45:10" type="SOCKET" message="Connection established: Browsers.ubuntu('Chrome')" />
              <LogLine time="10:45:12" type="SECURITY" message="Autonomous Resource Janitor monitoring active" />
              <LogLine time="11:20:44" type="MESSAGE" message="Incoming cmd: .ping from @owner" />
              <LogLine time="11:20:45" type="RESPONSE" message="Boxed style response sent successfully" />
              <div className="animate-pulse-subtle h-2 w-24 bg-primary/20 rounded mt-4" />
            </div>
          </CardContent>
        </Card>

        {/* Bot System Health */}
        <Card className="bg-card border-border shadow-2xl">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 font-headline text-primary">
              <Activity className="w-5 h-5" />
              SYSTEM VITALS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <HealthMetric label="CPU Usage" value={18} />
            <HealthMetric label="RAM (Janitor Threshold: 75%)" value={42} />
            <HealthMetric label="Network Latency" value={120} max={1000} suffix="ms" />
            
            <div className="pt-6 border-t border-border/50">
              <h4 className="text-sm font-bold text-secondary mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                SECURITY PROTOCOLS
              </h4>
              <ul className="space-y-3">
                <SecurityItem label="Anti-Link" active={true} />
                <SecurityItem label="Anti-Delete" active={true} />
                <SecurityItem label="Session Encryption" active={true} />
                <SecurityItem label="Resource Janitor" active={true} />
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function StatusCard({ title, value, icon, description }: any) {
  return (
    <Card className="bg-card hover:border-primary/50 transition-colors border-border shadow-md">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{title}</p>
            <p className="text-2xl font-headline font-bold text-foreground">{value}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">{description}</p>
      </CardContent>
    </Card>
  )
}

function LogLine({ time, type, message }: any) {
  const typeColors: any = {
    SYSTEM: 'text-blue-400',
    AUTH: 'text-purple-400',
    DATABASE: 'text-green-400',
    LOADER: 'text-yellow-400',
    SOCKET: 'text-primary',
    SECURITY: 'text-secondary',
    MESSAGE: 'text-muted-foreground',
    RESPONSE: 'text-primary'
  }
  
  return (
    <div className="flex gap-4">
      <span className="text-muted-foreground shrink-0">[{time}]</span>
      <span className={`shrink-0 font-bold w-20 ${typeColors[type] || 'text-white'}`}>{type}</span>
      <span className="text-foreground/80 break-all">{message}</span>
    </div>
  )
}

function HealthMetric({ label, value, max = 100, suffix = '%' }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-primary font-bold">{value}{suffix}</span>
      </div>
      <Progress value={(value / max) * 100} className="h-1 bg-muted" />
    </div>
  )
}

function SecurityItem({ label, active }: any) {
  return (
    <li className="flex justify-between items-center text-xs">
      <span className={active ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
      <Badge variant={active ? 'default' : 'secondary'} className="h-4 px-1 text-[10px] bg-primary/20 text-primary border-0">
        {active ? 'RUNNING' : 'DISABLED'}
      </Badge>
    </li>
  )
}
