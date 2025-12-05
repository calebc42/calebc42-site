import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# 1. THE DATA
data = {
    'Rep Name': ['Emily Jones', 'Kevin Lee', 'Jasmine Patel', 'Oliver Kim', 'Samantha Johnson', 'Daniel Wong', 'Sarah Davis', 'Michael Chen', 'Rachel Garcia', 'David Rodriguez'],
    'Leads Attempted': [200, 145, 122, 218, 173, 185, 210, 281, 179, 218],
    'App Qualified': [123, 60, 62, 87, 79, 92, 87, 93, 105, 173],
    'Signed Deals': [106, 55, 59, 80, 73, 90, 85, 91, 98, 100],
    'Conversion_Rate': [35.3, 36.7, 46.1, 36.4, 40.6, 46.6, 40.1, 32.3, 49.5, 36.8], # Lead to Deal
    'Win_Rate': [86, 92, 95, 92, 92, 98, 98, 98, 93, 58] # Qual to Deal
}

df = pd.DataFrame(data)

# 2. CHART A: The "Performance Quadrant" (Scatter Plot)
# X = Volume (Leads Attempted), Y = Efficiency (Conversion Rate)
fig_scatter = px.scatter(
    df,
    x="Leads Attempted",
    y="Conversion_Rate",
    text="Rep Name",
    size="Signed Deals", # Bubble size = Total Wins
    color="Win_Rate",    # Color = Deal Quality (Red = low close rate)
    color_continuous_scale="RdYlGn",
    title="Sales Efficiency: Volume vs. Conversion",
    labels={"Conversion_Rate": "Lead-to-Deal Conversion %", "Win_Rate": "Close Rate (Qual -> Deal)"},
    template="plotly_white"
)

fig_scatter.update_traces(textposition='top center')
fig_scatter.update_layout(height=600)

# Save as interactive HTML
fig_scatter.write_html("scatter_plot.html", include_plotlyjs='cdn', full_html=False)


# 3. CHART B: The "Leakage" Comparison (Funnel)
# Comparing the 'Archetypes': Emily (Efficiency) vs David (Leaky Bucket)
categories = ['Leads Attempted', 'App Qualified', 'Signed Deals']
emily_data = [200, 123, 106]
david_data = [218, 173, 100]

fig_funnel = go.Figure()

fig_funnel.add_trace(go.Funnel(
    name='Emily Jones (High Eff)',
    y=categories,
    x=emily_data,
    textinfo="value+percent initial"
))

fig_funnel.add_trace(go.Funnel(
    name='David Rodriguez (Leaky)',
    y=categories,
    x=david_data,
    textinfo="value+percent initial"
))

fig_funnel.update_layout(
    title="Funnel Leakage Comparison: The 'Sniper' vs. The 'Machine'",
    template="plotly_white",
    height=500
)

# Save as interactive HTML
fig_funnel.write_html("funnel_chart.html", include_plotlyjs='cdn', full_html=False)

print("Charts generated: scatter_plot.html and funnel_chart.html")
