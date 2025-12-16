import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Bot,
  Cpu,
  Zap,
  Shield,
  Coins,
  MessageSquare,
  FileCode,
  Search,
  GitBranch,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  Workflow
} from "lucide-react";

interface Agent {
  name: string;
  description: string;
  version: string;
  capabilities: string[];
  pricing?: {
    basePrice: number;
    currency: string;
    unit: string;
  };
  status: string;
  parentAgent?: string;
  specialization?: string;
}

interface AgentStats {
  total: number;
  mainAgents: number;
  subAgents: number;
  byParent: Record<string, number>;
}

const agentIcons: Record<string, React.ReactNode> = {
  'account-agent': <Coins className="h-5 w-5" />,
  'hts-agent': <Zap className="h-5 w-5" />,
  'hcs-agent': <MessageSquare className="h-5 w-5" />,
  'contract-agent': <FileCode className="h-5 w-5" />,
  'query-agent': <Search className="h-5 w-5" />,
  'coordinator-agent': <GitBranch className="h-5 w-5" />,
  'pqc-agent': <Shield className="h-5 w-5" />,
};

const getAgentIcon = (name: string) => {
  for (const [key, icon] of Object.entries(agentIcons)) {
    if (name.includes(key.replace('-agent', ''))) {
      return icon;
    }
  }
  return <Bot className="h-5 w-5" />;
};

export default function AgentHub() {
  const { toast } = useToast();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [executeInput, setExecuteInput] = useState("{}");
  const [taskDescription, setTaskDescription] = useState("");
  const [executionResult, setExecutionResult] = useState<any>(null);

  // Fetch all agents
  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ["/api/agents"],
    queryFn: async () => {
      const res = await fetch("/api/agents");
      if (!res.ok) throw new Error("Failed to fetch agents");
      return res.json();
    },
  });

  // Fetch agent stats
  const { data: statsData } = useQuery({
    queryKey: ["/api/agents/stats"],
    queryFn: async () => {
      const res = await fetch("/api/agents/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  // Execute agent mutation
  const executeAgentMutation = useMutation({
    mutationFn: async ({ agentName, input }: { agentName: string; input: any }) => {
      const res = await fetch(`/api/agents/${agentName}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (!res.ok) throw new Error("Execution failed");
      return res.json();
    },
    onSuccess: (data) => {
      setExecutionResult(data);
      toast({
        title: "Agent Executed",
        description: `Execution completed in ${data.result?.executionTime}ms`,
      });
    },
    onError: (error) => {
      toast({
        title: "Execution Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Plan task mutation
  const planTaskMutation = useMutation({
    mutationFn: async (task: string) => {
      const res = await fetch("/api/agents/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
      if (!res.ok) throw new Error("Planning failed");
      return res.json();
    },
    onSuccess: (data) => {
      setExecutionResult(data);
      toast({
        title: "Task Planned",
        description: `Generated ${data.plan?.suggestedWorkflow?.length || 0} workflow steps`,
      });
    },
  });

  const stats: AgentStats = statsData?.stats || { total: 0, mainAgents: 0, subAgents: 0, byParent: {} };
  const mainAgents: Agent[] = agentsData?.mainAgents || [];
  const subAgents: Agent[] = agentsData?.subAgents || [];

  const handleExecute = () => {
    if (!selectedAgent) return;
    try {
      const input = JSON.parse(executeInput);
      executeAgentMutation.mutate({ agentName: selectedAgent.name, input });
    } catch (e) {
      toast({
        title: "Invalid JSON",
        description: "Please enter valid JSON input",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Cpu className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Agent Hub</h1>
                <p className="text-sm text-zinc-400">HEDERA ML-Agent Orchestration</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-500">{stats.total}</p>
                <p className="text-xs text-zinc-400">Total Agents</p>
              </div>
              <Separator orientation="vertical" className="h-10 bg-zinc-800" />
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-500">{stats.mainAgents}</p>
                <p className="text-xs text-zinc-400">Main Agents</p>
              </div>
              <Separator orientation="vertical" className="h-10 bg-zinc-800" />
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-500">{stats.subAgents}</p>
                <p className="text-xs text-zinc-400">Sub-Agents</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="agents" className="data-[state=active]:bg-zinc-800">
              <Bot className="h-4 w-4 mr-2" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="workflow" className="data-[state=active]:bg-zinc-800">
              <Workflow className="h-4 w-4 mr-2" />
              Workflow Builder
            </TabsTrigger>
            <TabsTrigger value="execute" className="data-[state=active]:bg-zinc-800">
              <Play className="h-4 w-4 mr-2" />
              Execute
            </TabsTrigger>
          </TabsList>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            {/* Main Agents */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-emerald-500" />
                Main Agents ({mainAgents.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {agentsLoading ? (
                  <div className="col-span-full flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                  </div>
                ) : (
                  mainAgents.map((agent) => (
                    <Card
                      key={agent.name}
                      className="bg-zinc-900/50 border-zinc-800 hover:border-emerald-500/50 transition-all cursor-pointer"
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="p-2 bg-emerald-500/10 rounded-lg">
                            {getAgentIcon(agent.name)}
                          </div>
                          <Badge variant="outline" className="text-emerald-500 border-emerald-500/50">
                            v{agent.version}
                          </Badge>
                        </div>
                        <CardTitle className="text-base mt-2">{agent.name}</CardTitle>
                        <CardDescription className="text-xs line-clamp-2">
                          {agent.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {agent.capabilities.slice(0, 3).map((cap) => (
                            <Badge key={cap} variant="secondary" className="text-xs bg-zinc-800">
                              {cap}
                            </Badge>
                          ))}
                          {agent.capabilities.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-zinc-800">
                              +{agent.capabilities.length - 3}
                            </Badge>
                          )}
                        </div>
                        {agent.pricing && (
                          <p className="text-xs text-zinc-500 mt-2">
                            ${agent.pricing.basePrice} {agent.pricing.currency} / {agent.pricing.unit}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Sub-Agents */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-purple-500" />
                Sub-Agents ({subAgents.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {subAgents.map((agent) => (
                  <Card
                    key={agent.name}
                    className="bg-zinc-900/50 border-zinc-800 hover:border-purple-500/50 transition-all cursor-pointer"
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          {getAgentIcon(agent.name)}
                        </div>
                        <Badge variant="outline" className="text-purple-500 border-purple-500/50 text-xs">
                          {agent.parentAgent}
                        </Badge>
                      </div>
                      <CardTitle className="text-base mt-2">{agent.name}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2">
                        {agent.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.slice(0, 2).map((cap) => (
                          <Badge key={cap} variant="secondary" className="text-xs bg-zinc-800">
                            {cap}
                          </Badge>
                        ))}
                        {agent.capabilities.length > 2 && (
                          <Badge variant="secondary" className="text-xs bg-zinc-800">
                            +{agent.capabilities.length - 2}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Workflow Builder Tab */}
          <TabsContent value="workflow" className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-blue-500" />
                  AI Task Planner
                </CardTitle>
                <CardDescription>
                  Describe what you want to accomplish and the AI will generate a workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="e.g., Create a new token, airdrop it to 100 accounts, and track all transactions"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 min-h-[100px]"
                />
                <Button
                  onClick={() => planTaskMutation.mutate(taskDescription)}
                  disabled={!taskDescription || planTaskMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {planTaskMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Generate Workflow
                </Button>

                {executionResult?.plan && (
                  <div className="mt-6 space-y-4">
                    <h3 className="font-semibold text-emerald-500">Generated Workflow</h3>
                    <div className="space-y-2">
                      {executionResult.plan.suggestedWorkflow?.map((step: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{step.agentName}</p>
                            <p className="text-xs text-zinc-400">
                              {JSON.stringify(step.input)}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-zinc-500" />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <span>Estimated Cost: ${executionResult.plan.estimatedCost?.toFixed(4)}</span>
                      <span>Confidence: {(executionResult.plan.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Execute Tab */}
          <TabsContent value="execute" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Agent Selection & Input */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-emerald-500" />
                    Execute Agent
                  </CardTitle>
                  <CardDescription>
                    Select an agent and provide input to execute
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Select Agent</label>
                    <Select
                      value={selectedAgent?.name || ""}
                      onValueChange={(value) => {
                        const agent = [...mainAgents, ...subAgents].find((a) => a.name === value);
                        setSelectedAgent(agent || null);
                      }}
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-700">
                        <SelectValue placeholder="Choose an agent" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <div className="px-2 py-1 text-xs text-zinc-500 font-semibold">Main Agents</div>
                        {mainAgents.map((agent) => (
                          <SelectItem key={agent.name} value={agent.name}>
                            {agent.name}
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1 text-xs text-zinc-500 font-semibold mt-2">Sub-Agents</div>
                        {subAgents.map((agent) => (
                          <SelectItem key={agent.name} value={agent.name}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedAgent && (
                    <>
                      <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                        <p className="text-sm font-medium">{selectedAgent.name}</p>
                        <p className="text-xs text-zinc-400 mt-1">{selectedAgent.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedAgent.capabilities.map((cap) => (
                            <Badge key={cap} variant="secondary" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Input (JSON)</label>
                        <Textarea
                          value={executeInput}
                          onChange={(e) => setExecuteInput(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 font-mono text-sm min-h-[150px]"
                          placeholder='{"action": "balance"}'
                        />
                      </div>

                      <Button
                        onClick={handleExecute}
                        disabled={executeAgentMutation.isPending}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        {executeAgentMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        Execute Agent
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Execution Result */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {executionResult?.success ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : executionResult?.success === false ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-zinc-500" />
                    )}
                    Execution Result
                  </CardTitle>
                  <CardDescription>
                    {executionResult
                      ? `Completed in ${executionResult.result?.executionTime || 0}ms`
                      : "Execute an agent to see results"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {executionResult ? (
                      <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap">
                        {JSON.stringify(executionResult, null, 2)}
                      </pre>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                        <Bot className="h-12 w-12 mb-4 opacity-50" />
                        <p>No execution results yet</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Agent Detail Dialog */}
      <Dialog open={!!selectedAgent && !executeAgentMutation.isPending} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                {selectedAgent && getAgentIcon(selectedAgent.name)}
              </div>
              {selectedAgent?.name}
            </DialogTitle>
            <DialogDescription>{selectedAgent?.description}</DialogDescription>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-2">Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.capabilities.map((cap) => (
                    <Badge key={cap} variant="secondary">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>
              {selectedAgent.pricing && (
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Pricing</h4>
                  <p className="text-emerald-500 font-semibold">
                    ${selectedAgent.pricing.basePrice} {selectedAgent.pricing.currency} / {selectedAgent.pricing.unit}
                  </p>
                </div>
              )}
              {selectedAgent.parentAgent && (
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Parent Agent</h4>
                  <Badge variant="outline">{selectedAgent.parentAgent}</Badge>
                </div>
              )}
              <Button
                onClick={() => {
                  setSelectedAgent(selectedAgent);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Execute This Agent
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
