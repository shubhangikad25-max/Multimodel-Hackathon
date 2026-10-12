import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Performance({ metrics }: any) {
  
  if (!metrics || Object.keys(metrics).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">Evaluation Pending</h2>
        <p className="text-muted-foreground max-w-md">
          Model training or evaluation has not been completed yet.
        </p>
      </div>
    );
  }

  // Transform metrics for the chart
  const chartData = Object.keys(metrics).map(target => ({
    name: target,
    Accuracy: metrics[target].Accuracy * 100,
    AUC: metrics[target]['ROC-AUC'] ? metrics[target]['ROC-AUC'] * 100 : 0,
    F1: metrics[target].F1 * 100,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-xl font-bold text-primary mb-6">Model Performance Overview</h2>
        
        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" stroke="#8892b0" tick={{fill: '#8892b0'}} axisLine={{stroke: '#1f2937'}} />
              <YAxis stroke="#8892b0" tick={{fill: '#8892b0'}} axisLine={{stroke: '#1f2937'}} domain={[0, 100]} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#0a192f', borderColor: '#1f2937', color: '#e6f1ff' }}
                itemStyle={{ color: '#64ffda' }}
                cursor={{ fill: '#112240' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="Accuracy" fill="#64ffda" radius={[4, 4, 0, 0]} />
              <Bar dataKey="AUC" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="F1" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(metrics).map(target => {
          const m = metrics[target];
          return (
            <div key={target} className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-brand-cyan mb-4 border-b border-border pb-2">{target} Model</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                  <div className="text-xs text-slate-400 mb-1">Accuracy</div>
                  <div className="text-xl font-bold text-white">{(m.Accuracy * 100).toFixed(1)}%</div>
                </div>
                <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                  <div className="text-xs text-slate-400 mb-1">ROC-AUC</div>
                  <div className="text-xl font-bold text-white">{m['ROC-AUC'] ? (m['ROC-AUC'] * 100).toFixed(1) + '%' : 'N/A'}</div>
                </div>
                <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                  <div className="text-xs text-slate-400 mb-1">Precision</div>
                  <div className="text-xl font-bold text-white">{(m.Precision * 100).toFixed(1)}%</div>
                </div>
                <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                  <div className="text-xs text-slate-400 mb-1">Recall</div>
                  <div className="text-xl font-bold text-white">{(m.Recall * 100).toFixed(1)}%</div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Confusion Matrix (Validation Set)</h4>
                <div className="bg-[#0b1120] rounded-lg p-4 border border-border/50 overflow-x-auto">
                  <table className="w-full text-sm text-center">
                    <thead>
                      <tr>
                        <th className="p-2 border-b border-r border-border/50 text-slate-400 font-medium">True \ Pred</th>
                        <th className="p-2 border-b border-border/50 text-slate-300">Predict {m.Classes['0']}</th>
                        <th className="p-2 border-b border-border/50 text-slate-300">Predict {m.Classes['1']}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border-r border-border/50 text-slate-300 font-medium text-left">Actual {m.Classes['0']}</td>
                        <td className="p-2 text-white font-mono bg-green-900/20">{m.ConfusionMatrix[0][0]}</td>
                        <td className="p-2 text-white font-mono bg-red-900/20">{m.ConfusionMatrix[0][1]}</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-border/50 text-slate-300 font-medium text-left">Actual {m.Classes['1']}</td>
                        <td className="p-2 text-white font-mono bg-red-900/20">{m.ConfusionMatrix[1][0]}</td>
                        <td className="p-2 text-white font-mono bg-green-900/20">{m.ConfusionMatrix[1][1]}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  * Evaluated on stratified 20% holdout (Support: {m.Support}). Model: Random Forest.
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
