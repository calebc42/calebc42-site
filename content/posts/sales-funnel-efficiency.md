+++
title = "Case Study: Sales Funnel Efficiency & Rep Performance Analysis"
author = ["desktop"]
date = 2025-12-01
lastmod = 2025-12-04T16:35:40-07:00
draft = false
+++

## Overview {#overview}


### Role {#role}

Revenue Operations Analyst / Sales Strategy Lead


### Objective {#objective}

Analyze raw sales performance data to identify revenue leakage, optimize lead distribution, and define enablement strategies.


### Context {#context}

<div class="note">

**About This Case Study:**
This analysis was completed as a take-home exercise during an interview for a Revenue Operations role. I was provided raw sales data and given 48 hours to identify optimization opportunities and present actionable recommendations.

**Relevant Experience:** As a former funding manager, I observed similar lead distribution patterns firsthand—watching reps monitor pipeline dashboards and strategically claim leads during optimal windows. This operational context informs my analysis of behavioral patterns that purely quantitative analysis might miss.

</div>

{{< figure src="/images/heatmap-screenshot.png" caption="<span class=\"figure-number\">Figure 1: </span>Sales Efficiency Heatmap Data" width="100%" >}}


## 1. The Data Source {#1-dot-the-data-source}

Before applying any strategic frameworks, I aggregated the raw performance metrics for the trailing quarter. This dataset tracks the full lifecycle from lead assignment to signed deal.


### Raw Data Summary {#raw-data-summary}

<div class="ox-hugo-table table table-striped">
<div class="table-caption">
  <span class="table-number">Table 1:</span>
  Sales Rep Performance Data (Raw Counts)
</div>

| Rep Name         | Assigned     | Attempted    | Contacted    | App Completes | App Qualified | Signed Deals |
|------------------|--------------|--------------|--------------|---------------|---------------|--------------|
| Emily Jones      | 300          | 200          | 150          | 140           | 123           | 106          |
| Kevin Lee        | 150          | 145          | 108          | 68            | 60            | 55           |
| Jasmine Patel    | 128          | 122          | 112          | 75            | 62            | 59           |
| Oliver Kim       | 220          | 218          | 150          | 102           | 87            | 80           |
| Samantha Johnson | 180          | 173          | 98           | 91            | 79            | 73           |
| Daniel Wong      | 193          | 185          | 150          | 108           | 92            | 90           |
| Sarah Davis      | 212          | 210          | 138          | 97            | 87            | 85           |
| Michael Chen     | 282          | 281          | 223          | 102           | 93            | 91           |
| Rachel Garcia    | 198          | 179          | 150          | 132           | 105           | 98           |
| David Rodriguez  | 272          | 218          | 203          | 198           | 173           | 100          |
| ****TOTAL****    | ****2135**** | ****1931**** | ****1482**** | ****1113****  | ****961****   | ****837****  |

</div>


## 2. The Analytical Framework: "Right-to-Left" Prioritization {#2-dot-the-analytical-framework-right-to-left-prioritization}

My approach to analyzing sales data prioritizes ****Revenue Velocity****. I analyze the funnel from ****Right to Left**** (Deal Signed \\(\rightarrow\\) Top of Funnel).

1.  ****Bottom of Funnel:**** Fix leakage closest to the revenue first (High immediate impact).
2.  ****Top of Funnel:**** Optimize lead utilization and activity efficiency (Long-term scalability).

<div class="important">

**Philosophy on Controllable Metrics:**

When coaching reps, I prioritize metrics they can directly control. "App Completed" is more controllable than "App Qualified" because it measures persuasion and persistence—skills that can be coached. "App Qualified" depends heavily on factors outside the rep's control: the prospect's credit score, business financials, time in business, and market conditions.

By focusing coaching on controllable behaviors (outreach quality, objection handling, urgency creation), we increase activity and let the qualification rate settle naturally based on lead quality. Marketing and lead sourcing should optimize for qualification rates; Sales should optimize for conversion rates.

_Qualification is a filtering function; completion is a persuasion function._ Sales reps should be measured primarily on what they can influence through skill.

</div>


## 3. Key Data Observations &amp; Performance Archetypes {#3-dot-key-data-observations-and-performance-archetypes}

Upon reviewing the rep performance heatmap, four distinct performance archetypes emerged that require different operational interventions.

<iframe src="/charts/scatter_plot.html" width="100%" height="650" style="border:none; margin-bottom: 20px;"></iframe>

<details>
<summary>
  Click to view the Python generation script
</summary>
<div>
  <p>I wrote this script to automate the generation of these insights using <strong>Pandas</strong> and <strong>Plotly</strong>, ensuring the analysis is repeatable as data scales.</p>
  </p>

```python
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
```

</div>
</details>


### A. The "High-Efficiency / Low-Volume" Performer (Emily Jones) {#a-dot-the-high-efficiency-low-volume-performer--emily-jones}

-   ****Data:**** Emily attempts only 67% of assigned leads (200/300) versus a team average of 90%, but maintains elite conversion rates at every subsequent stage:
    -   Contact → App Complete: 93% (vs. team avg 75%)
    -   App Qualified → Signed: 86% (vs. team avg 87%)

-   ****Hypothesis 1 (Behavioral):**** Emily may be relationship-driven with long talk times and deep discovery calls. This drives exceptional conversion quality but limits throughput. She likely excels at building trust but may lack urgency in closing sequences or post-qualification follow-up.

-   ****Hypothesis 2 (Strategic):**** She may be pre-qualifying leads before logging attempts, working only high-confidence opportunities while allowing lower-quality leads to age in her queue.

-   ****Diagnostic Tests:****
    -   Compare average talk time per contact vs. team average
    -   Measure time-to-first-attempt after lead assignment
    -   Review lead aging in her pipeline vs. peers

-   ****Risk:**** If hypothesis 2 is correct, valuable leads are stagnating. High-quality leads that Emily doesn't prioritize could be worked by hungrier reps. If hypothesis 1 is correct, she simply needs coaching on urgency and time management—her skills are excellent.


### B. The "High-Volume / Low-Conversion" Reps (Michael Chen, Sarah Davis) {#b-dot-the-high-volume-low-conversion-reps--michael-chen-sarah-davis}

-   ****Data:**** These reps attempt 99%+ of assigned leads but show poor mid-funnel conversion:
    -   Michael: 36% Lead → App Complete (vs. team avg 52%)
    -   Sarah: 46% Lead → App Complete (vs. team avg 52%)

-   ****However:**** Their App Qualified → Signed rates are elite:
    -   Michael: 98% (93/95 qualified apps closed)
    -   Sarah: 98% (85/87 qualified apps closed)

-   ****Diagnosis:**** "Spray and Pray" methodology. They're burning through lead inventory rapidly with low-effort touches, filtering for "layup" deals—prospects so motivated they'll close with minimal sales effort. Any applications they complete are nearly guaranteed to close because they're only advancing slam-dunk opportunities.

-   ****Risk:**** High opportunity cost. Difficult-but-viable leads are being "scorched" by insufficient outreach. These leads could convert with proper nurturing but are being marked as dead after 2-3 cursory attempts.

-   ****Opportunity (Cross-Functional Insight):**** This behavior may actually identify a valuable customer segment—\*\*high-urgency, low-complexity buyers\*\*. Rather than forcing Michael and Sarah to adopt slower, relationship-driven approaches, consider:
    1.  ****Routing Strategy:**** Funnel hot inbound leads to them for rapid conversion
    2.  ****Product Fit:**** These customers may be ideal for self-service products or marketplace offerings where speed matters more than customization
    3.  ****Upsell Potential:**** Flag their closed deals for post-sale upsell into premium products—they converted on urgency, not on relationship, which means there's likely expansion revenue available once their immediate need is met


### C. The "Leaky Bucket" (David Rodriguez) {#c-dot-the-leaky-bucket--david-rodriguez}

-   ****Data:**** David drives massive volume into the pipeline but catastrophically fails at the final stage:
    -   Highest absolute app completes: 198 (next closest is Emily at 140)
    -   Highest absolute qualified apps: 173 (next closest is Emily at 123)
    -   App Qualified → Signed: ****58%**** (100/173)
    -   Team average App Qualified → Signed: ****87%****

-   ****Diagnosis:**** Poor qualification discipline. David is pushing unqualified applications through the system, inflating his mid-funnel metrics while creating enormous waste at the bottom of the funnel. He's likely being rewarded for app volume without accountability for deal quality.

-   ****Revenue Impact:**** If David could match Jasmine's 95% close rate on qualified apps, he would deliver an additional ****64 deals per period**** (173 × 0.95 - 100 = 64.35) with zero additional lead acquisition cost. This represents the ****single largest revenue recovery opportunity**** in the dataset.

-   ****Coaching Priority:**** Pair David with Rachel Garcia (who has both high volume AND 93% qualified-to-signed rate) to learn rigorous qualification frameworks—specifically, what questions to ask before marking an app as "qualified."


### D. The "Balanced Excellence" Performers (Rachel Garcia, Daniel Wong, Jasmine Patel) {#d-dot-the-balanced-excellence-performers--rachel-garcia-daniel-wong-jasmine-patel}

-   ****Data:**** These reps show consistent, above-average performance across all funnel stages with no major bottlenecks:
    -   Rachel: 90% attempt rate, 76% contact rate, 88% complete rate, 93% close rate
    -   Daniel: 96% attempt rate, 81% contact rate, 72% complete rate, 98% close rate
    -   Jasmine: 95% attempt rate, 92% contact rate, 67% complete rate, 95% close rate

-   ****Diagnosis:**** These reps represent the ****behavioral template**** the team should be coached toward. They balance activity (high attempt rates), effectiveness (strong contact conversion), and discipline (elite closing efficiency).

-   ****Application:**** Use their techniques as the coaching baseline:
    -   Rachel's qualification rigor (to fix David)
    -   Jasmine's contact-to-complete conversion (to fix Michael/Sarah)
    -   Daniel's balanced consistency (general best practices)


## 4. Strategic Recommendations {#4-dot-strategic-recommendations}

<iframe src="/charts/funnel_chart.html" width="100%" height="550" style="border:none;"></iframe>


### 4.1 Immediate Process Improvements {#4-dot-1-immediate-process-improvements}


#### Lead Distribution Logic Reform {#lead-distribution-logic-reform}

****Current State Diagnosis:**** Based on my experience as a funding manager observing similar sales environments, the data strongly suggests a ****self-regulated lead flow system****. In these systems, reps can see available leads and claim them at will, which creates cherry-picking behavior.

****Observable Pattern:**** High performers monitor pipeline dashboards and strategically claim leads during optimal windows (right after they come in, during business hours, from preferred industries). Lower performers work whatever remains—aged leads, off-hours inquiries, difficult industries.

This creates a performance gap that **appears** to be skill-based but is actually **access-based**. Emily's 67% attempt rate is likely not laziness—it's selectivity. Michael's 99% attempt rate with poor conversion suggests he's claiming everything indiscriminately.

****Recommended Fix: Cap-and-Recycle System****

-   Implement maximum lead assignment caps per rep based on their demonstrated throughput
-   Emily's cap: 200 leads/period (her current attempted volume) until her attempt rate rises to 85%+
-   Route Emily's overflow leads to Daniel and Rachel (proven high-performers with capacity)
-   Implement "lead aging" triggers: If a lead sits untouched for 48 hours, automatically reassign

****Expected Impact:****

-   Reduces lead hoarding by top performers
-   Ensures all leads receive timely attention
-   Forces behavioral change (Emily must attempt more or lose access)


#### Qualification Standards Audit {#qualification-standards-audit}

****Problem:**** David's 58% close rate on "qualified" apps indicates a fundamental misalignment on what constitutes "qualified."

****Action Items:****

1.  Audit David's 73 closed-lost opportunities from qualified apps
    -   What commonalities exist? (Credit issues, business age, industry, decision-maker access)
2.  Compare against Rachel's closed-lost deals (she has only ~7 lost deals from 105 qualified)
3.  Codify the difference into mandatory qualification checkpoints:
    -   Credit pre-screen before marking as qualified
    -   Decision-maker confirmation (not just "spoke to someone")
    -   Budget/timeline verification
    -   Competitive situation assessment

****Expected Impact:**** Reduce David's qualified app volume by ~30%, but increase his close rate to 85%+, resulting in net positive deal flow.


### 4.2 Operational Enablement: Peer-Led Coaching (Pilot-Then-Scale) {#4-dot-2-operational-enablement-peer-led-coaching--pilot-then-scale}

Rather than team-wide training rollouts, I recommend a ****pilot-then-scale**** approach that focuses resources on the highest-impact opportunities first.


#### Phase 1: High-Impact Coaching Pairs (Weeks 1-4) {#phase-1-high-impact-coaching-pairs--weeks-1-4}

****Pair 1: David Rodriguez (Leaky Bucket) + Rachel Garcia (Balanced Excellence)****

-   ****Focus:**** Qualification discipline
-   ****Activities:****
    -   Rachel shadows 5 of David's qualification calls
    -   David shadows 5 of Rachel's qualification calls
    -   Joint debrief: What questions does Rachel ask that David skips?
    -   Document Rachel's qualification framework into a 1-page checklist
-   ****Success Metric:**** Move David's qualified-to-close rate from 58% to 75% (midpoint toward team average)
-   ****Revenue Impact:**** +29 additional deals if successful

****Pair 2: Michael Chen (High-Volume/Low-Convert) + Jasmine Patel (Elite Mid-Funnel)****

-   ****Focus:**** Contact-to-application conversion
-   ****Activities:****
    -   Compare objection-handling techniques
    -   Review Michael's "dead lead" list—are they truly dead, or insufficiently worked?
    -   Jasmine demonstrates her follow-up cadence (likely multi-touch, multi-channel)
    -   Document Jasmine's persistence framework
-   ****Success Metric:**** Move Michael's lead-to-app rate from 36% to 45% (halfway to team average)
-   ****Revenue Impact:**** +25 additional apps → ~24 additional deals

****Pair 3: Emily Jones + Time Management Coach (External or Manager)****

-   ****Focus:**** Velocity without sacrificing quality
-   ****Activities:****
    -   Time audit: Track Emily's hours-per-deal vs. team average
    -   If talk time is excessive, coach on qualifying-out faster ("Is this a fit? If not, let's save both our time")
    -   Implement time-boxing: Max 2 hours per lead before moving to next
    -   Add urgency frameworks to her closing sequences
-   ****Success Metric:**** Increase Emily's attempt rate from 67% to 85% while maintaining 80%+ close rate
-   ****Revenue Impact:**** +54 additional attempts → ~26 additional deals


#### Phase 2: Document and Scale (Weeks 5-8) {#phase-2-document-and-scale--weeks-5-8}

****Only if Phase 1 shows measurable improvement:****

1.  Record successful coaching sessions and create training library
2.  Extract specific techniques (call scripts, qualification questions, email templates, objection responses)
3.  Roll out to Kevin, Oliver, and Samantha through:
    -   Weekly recorded call reviews
    -   Practice sessions with successful reps
    -   Manager observation and feedback

****Rationale for Phased Approach:**** This de-risks the coaching investment. We validate what actually moves the needle before committing team-wide resources, and we focus first on reps with the largest revenue recovery potential (David's 64-deal gap &gt;&gt; Michael's 25-deal gap &gt;&gt; Emily's 26-deal gap).


### 4.3 Missing Metrics &amp; Data Integrity {#4-dot-3-missing-metrics-and-data-integrity}

To validate these hypotheses and make fully informed recommendations, I would need access to the following data points:


#### Critical Missing Metrics {#critical-missing-metrics}

1.  ****App Qualified to Signed Deal % (by rep)**** – This isolates "closing ability" from "qualification discipline"
    -   I calculated this manually for key reps, but it should be a standard dashboard metric

2.  ****Activity Depth Metrics:****
    -   ****Dials per lead before first contact**** – Are low contact rates due to insufficient effort or bad lead data?
    -   ****Average touches per lead before "Attempted" status**** – Does "Attempted" mean one dial or a full sequence?
    -   ****Channel mix breakdown**** – Calls vs. emails vs. SMS vs. social outreach
    -   ****Talk time per contact**** – Validates the Emily hypothesis (high quality/low volume)

3.  ****Lead Aging Metrics:****
    -   ****Time from assignment to first attempt (by rep)**** – Identifies hoarding behavior
    -   ****Leads older than 7 days in pipeline (by rep)**** – Quantifies stagnation

4.  ****Cadence Adherence:****
    -   ****% of leads receiving full prescribed sequence**** – Are reps following the playbook or freelancing?
    -   ****Time between touches**** – Consistency matters as much as volume


#### Why These Metrics Matter {#why-these-metrics-matter}

"Leads Attempted" is a binary metric that masks enormous variance in effort quality. Consider:

-   Rep A makes 15 dials over 3 days with personalized emails and LinkedIn touches
-   Rep B makes 2 dials at 10am on a Tuesday and marks it "attempted"

Both show "1 attempted lead" in the current dashboard, but represent completely different behaviors. Without activity depth data, I'm diagnosing based on outcome patterns—which is effective but less precise than diagnosing based on actual behavior.


### 4.4 Expected Business Impact {#4-dot-4-expected-business-impact}

Implementing these recommendations in sequence would yield:

<div class="ox-hugo-table table table-striped">
<div class="table-caption">
  <span class="table-number">Table 2:</span>
  Projected Revenue Recovery by Initiative
</div>

| Initiative                       | Current State  | Target State              | Additional Deals/Period | Est. Revenue Impact\* |
|----------------------------------|----------------|---------------------------|-------------------------|-----------------------|
| David's Closing Efficiency       | 58% close      | 75% close (conservative)  | 29                      | High                  |
| Michael's Lead Utilization       | 36% to app     | 45% to app (conservative) | 24                      | High                  |
| Emily's Lead Velocity            | 67% attempt    | 85% attempt               | 26                      | Medium-High           |
| Lead Distribution Optimization   | Self-regulated | Cap-and-recycle           | 10-15                   | Medium                |
| Sarah/Michael "Hot Lead" Routing | Mixed routing  | Segment-specific          | 5-8                     | Low (but strategic)   |
| ****TOTAL POTENTIAL****          |                |                           | ****94-102****          | ****Very High****     |

</div>

**Note: Revenue impact depends on average deal size, which is not provided in the dataset. If average deal value is $10K, this represents $940K-$1.02M in incremental revenue. If ADV is $50K, this represents $4.7M-$5.1M.**

****Assumptions:****

-   Based on trailing quarter data
-   Assumes current lead quality and volume remain constant
-   Conservative targets (moving halfway to team average, not to best-in-class)
-   Does not account for compounding effects (e.g., David closing more deals → more confidence → even better performance)


## 5. Executive Summary {#5-dot-executive-summary}

This analysis reveals that ****lead inefficiency, not lead volume****, is the primary constraint to revenue growth.

****Key Findings:****

1.  ****David Rodriguez**** represents a 64-deal recovery opportunity through qualification discipline
2.  ****Emily Jones**** is an underutilized asset—elite skills but artificial volume constraints
3.  ****Michael Chen and Sarah Davis**** may be optimally deployed on high-urgency segments rather than general pipeline
4.  ****Self-regulated lead distribution**** creates access inequality that appears as skill inequality

****Strategic Recommendation:****
By implementing territory-aware lead routing, peer-led coaching focused on the highest-impact gaps, and qualification standard reforms, this team can unlock an estimated ****94-102 additional deals per quarter**** (~11-12% revenue increase) without additional marketing spend.

****The path forward prioritizes:****

-   Bottom-of-funnel fixes first (David's close rate)
-   Controllable behavior changes (activity coaching for Michael/Emily)
-   Process improvements that prevent future leakage (lead distribution reform)


## 6. Implementation Roadmap (30-60-90 Days) {#6-dot-implementation-roadmap--30-60-90-days}


### Days 1-30: Discovery &amp; Quick Wins {#days-1-30-discovery-and-quick-wins}

-   ****Week 1:**** Present findings to sales leadership; gather context on territories, seasonal patterns, recent team changes
-   ****Week 2:**** Shadow Emily Jones (1 full day) and Michael Chen (1 full day) to validate behavioral hypotheses
-   ****Week 3:**** Launch David + Rachel coaching pilot; begin qualification audit
-   ****Week 4:**** Implement lead aging alerts (48-hour reassignment triggers); collect baseline metrics for coaching pairs


### Days 31-60: Process Changes &amp; Measurement {#days-31-60-process-changes-and-measurement}

-   ****Week 5:**** Roll out Cap-and-Recycle lead distribution system
-   ****Week 6:**** Review Phase 1 coaching results; document successful techniques if metrics improved
-   ****Week 7:**** Begin Phase 2 rollout to Kevin, Oliver, Samantha (if Phase 1 successful)
-   ****Week 8:**** Add "App Qualified → Signed %" to weekly dashboards; establish rep-specific improvement targets


### Days 61-90: Scale &amp; Optimize {#days-61-90-scale-and-optimize}

-   ****Week 9-10:**** Scale successful coaching practices team-wide through recorded sessions and practice reviews
-   ****Week 11:**** Adjust lead routing rules based on 60-day performance data
-   ****Week 12:**** Present 90-day results to leadership; refine targets for next quarter; identify new optimization opportunities

****Success Criteria:****

-   David's close rate: 58% → 75%+
-   Michael's lead-to-app: 36% → 45%+
-   Emily's attempt rate: 67% → 85%+
-   Team total deals: 837/quarter → 930+/quarter (+11%)

<strong>Implementation Note:</strong>
<p>These recommendations reflect analysis of trailing quarter data in isolation. Before implementation, I would:</p>
<ol>
  <li>Present findings to sales leadership to surface any territory/product/seasonal factors not visible in the data</li>
  <li>Shadow 2-3 reps (David, Emily, Michael) to validate behavioral hypotheses through direct observation</li>
  <li>Collaborate with Sales Operations and Enablement teams to ensure alignment with existing initiatives and avoid conflicting priorities</li>
  <li>Prioritize based on organizational capacity, change management bandwidth, and strategic focus areas</li>
</ol>
<p><strong>Strong data analysis provides the <em>what</em>—but organizational context determines the <em>how</em> and <em>when</em>.</strong> The metrics point to opportunities; leadership judgment determines which opportunities to pursue first.</p>
</div>
