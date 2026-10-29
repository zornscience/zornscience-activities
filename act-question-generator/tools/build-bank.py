import json, random
from pathlib import Path
out=Path(__file__).resolve().parents[1]
banks={s:[] for s in ['english','math','science']}
def add(s,skill,prompt,answer,wrong,explanation,context='',table=None):
    choices=list(map(str,[answer]+wrong)); assert len(set(choices))==4,(prompt,choices)
    random.Random(812+len(banks[s])*13).shuffle(choices)
    q=dict(id=f'{s}-{len(banks[s])+1:03}',skill=skill,prompt=prompt,choices=choices,answer=choices.index(str(answer)),explanation=explanation)
    if context:q['context']=context
    if table:q['table']=table
    banks[s].append(q)
# Ten settings give each editing task an original sentence and a clear local context.
settings=[('Maya','museum','exhibit','artifacts'),('Noah','garden','display','seedlings'),('Lena','library','collection','manuscripts'),('Omar','observatory','project','telescopes'),('Iris','aquarium','installation','tanks'),('Eli','theater','production','costumes'),('Zoe','laboratory','investigation','samples'),('Ava','workshop','demonstration','models'),('Leo','archive','catalog','photographs'),('Nina','conservatory','presentation','plants')]
for name,place,item,objects in settings:
    article = 'an' if item[0] in 'aeiou' else 'a'
    def e(skill,sentence,a,w,why,question='Which choice best completes the sentence in standard written English?'):
        add('english',skill,question,a,w,why,sentence)
    e('Subject–verb agreement',f'The {item}, along with several {objects}, ___ ready for visitors.','is',['are','were','have been'],f'The singular subject “{item}” takes “is.” The phrase beginning “along with” does not change the subject.')
    e('Subject–verb agreement',f'The {objects} in the {place} ___ examined every Friday.','are',['is','was','has been'],f'The plural subject “{objects}” requires the plural verb “are.”')
    e('Sentence boundaries',f'{name} organized the {item} ___ the visitors arrived.','before',['; before',', before,','before;'],'“Before the visitors arrived” is a dependent clause attached directly to the main clause.')
    e('Sentence boundaries',f'The {place} closed early ___ {name} returned the following morning.',';',[' ,','no punctuation',': because'],'A semicolon joins two complete, closely related sentences. A comma alone creates a comma splice.')
    e('Introductory punctuation',f'After inspecting the {objects} ___ {name} recorded several observations.',',',['; ',': ','no punctuation'],'Use a comma after an introductory dependent clause or phrase.')
    e('Nonessential information',f'{name}, the director of the {place} ___ welcomed the visitors.',',',['; ',': ','no punctuation'],'The nonessential appositive “the director of the '+place+'” must be set off with a pair of commas.')
    e('Possessives',f'The {place} has one director. The ___ notes describe the {item}.',"director’s",['directors',"directors’",'director'],'One director owns the notes, so use the singular possessive “director’s.”')
    e('Possessives',f'Three volunteers work at the {place}. The ___ schedules are posted by the door.',"volunteers’",["volunteer’s",'volunteers','volunteer'],'The schedules belong to several volunteers. Add an apostrophe after the plural ending -s.')
    e('Pronoun case',f'The director asked {name} and ___ to explain the {item}.','me',['I','myself','mine'],'The pronoun is an object of “asked.” Removing the other person makes the construction clear: “asked me.”')
    e('Pronoun case',f'___ and {name} arranged the {objects} before the opening.','She',['Her','Hers','Herself'],'The pronoun is part of the subject of “arranged,” so the subject form “She” is required.')
    e('Parallel structure',f'{name} enjoys planning the {item}, arranging the {objects}, and ___ visitors.','guiding',['to guide','guides','guided'],'The three items must share the same grammatical form: planning, arranging, and guiding.')
    e('Verb tense',f'Yesterday, {name} inspected the {objects} and ___ a detailed report.','wrote',['writes','will write','is writing'],'“Yesterday” and “inspected” establish the past tense; “wrote” keeps the sequence consistent.')
    e('Verb tense',f'By the time the {place} opened yesterday, {name} ___ the {item}.','had finished',['will finish','finishes','is finishing'],'The past perfect “had finished” places completion before another event in the past.')
    e('Adjective and adverb',f'{name} explained the {item} so ___ that every visitor understood it.','clearly',['clear','clearness','clearest'],'An adverb modifies the verb “explained.” “Clearly” tells how the explanation was delivered.')
    e('Concise expression',f'At the {place}, {name} made a plan ___ for the upcoming {item}.','in advance',['ahead of time in advance','in advance before it happened','beforehand ahead of time'],'“In advance” expresses the timing once. The other choices repeat the same idea.', 'Which choice completes the sentence most concisely without changing its meaning?')
    e('Logical transitions',f'The {place} had a small budget. ___, {name} created an impressive {item}.','Nevertheless',['Therefore','For example','Similarly'],'The second sentence contrasts the successful result with the budget limitation. “Nevertheless” signals that contrast.')
    e('Logical transitions',f'{name} labeled all the {objects}. ___, visitors could identify each one without assistance.','Consequently',['However','In contrast','Nevertheless'],'The second statement is a result of the labeling; “Consequently” shows cause and effect.')
    e('Modifier placement',f'While walking through the {place}, ___.',f'{name} noticed the {objects}',[f'the {objects} caught the attention of {name}',f'the {item} was visible to {name}',f'there were {objects} near {name}'],'The person walking must be the subject immediately after the introductory modifier. Only the correct choice makes that person the subject.')
    e('Rhetorical purpose',f'A writer is describing {name}’s careful preparation for {article} {item} at the {place}. Which sentence provides the most specific supporting detail?',f'{name} checked every label against the inventory and corrected three dates.',[f'The {place} is a building in the city.',f'{name} sometimes enjoys visiting other cities.',f'Many people think {article} {item} can be interesting.'],'Checking every label and correcting dates gives concrete evidence of careful preparation. The other details do not support that focus.', 'Which sentence best supports the stated focus?')
    e('Organization',f'[1] {name} prepared the {item} at the {place}. [2] Visitors tested it on opening day. [3] Their feedback led to several improvements. The writer wants to add: “Before the opening, staff members checked that every part worked.”','Between sentences 1 and 2',['Before sentence 1','Between sentences 2 and 3','After sentence 3'],'The check occurs after preparation but before opening day, so placing it between sentences 1 and 2 preserves the chronology.', 'Where should the new sentence be placed to make the sequence clearest?')
# Twenty math skills, with ten distinct numerical problems per skill.
for i in range(1,11):
    def m(skill,p,a,w,why): add('math',skill,p,a,w,why)
    a=i+2;b=2*i+1;x=i+3;c=a*x+b
    m('Linear equations',f'If {a}x + {b} = {c}, what is x?',x,[x+1,x-1,c-b],f'Subtract {b}, then divide by {a}: x = ({c} − {b})/{a} = {x}.')
    price=40+20*i;rate=10+5*i;result=price*(100-rate)//100
    m('Percents',f'A jacket priced at ${price} is discounted by {rate}%. What is the sale price, before tax?',result,[price,rate,result+price],f'The remaining price is {100-rate}% of ${price}: {price} × {1-rate/100:g} = ${result}.')
    n=3+i;total=5*n
    m('Ratios',f'A bag contains red and blue tiles in a ratio of 2:3. If there are {total} tiles total, how many are blue?',3*n,[2*n,n,4*n],f'There are 5 equal ratio parts. Each part has {n} tiles, and blue uses 3 parts: {3*n}.')
    slope=i+1;intercept=i-3
    m('Slope',f'A line passes through (1, {slope+intercept}) and (4, {4*slope+intercept}). What is its slope?',slope,[slope+1,3*slope,-slope],f'Slope is change in y divided by change in x: {3*slope}/3 = {slope}.')
    m('Linear functions',f'If f(x) = {a}x − {b}, what is f({i+4})?',a*(i+4)-b,[a*(i+4)+b,a*(i+4)-b-2,a*(i+4)-b+1],f'Substitute {i+4} for x: {a}({i+4}) − {b} = {a*(i+4)-b}.')
    r=i+2
    m('Quadratics',f'What is the positive solution of x² − {r*r} = 0?',r,[-r,r*r,r+1],f'x² = {r*r}, so x = ±{r}. The positive solution is {r}.')
    m('Factoring',f'Which expression is equivalent to x² + {2*i+3}x + {i*(i+3)}?',f'(x + {i})(x + {i+3})',[f'(x − {i})(x − {i+3})',f'(x + {i})(x − {i+3})',f'(x + {i+1})(x + {i+2})'],f'The two constants must multiply to {i*(i+3)} and add to {2*i+3}; {i} and {i+3} do both.')
    y=i+1;x=i+4
    m('Systems of equations',f'If x + y = {x+y} and x − y = 3, what is y?',y,[x,x+y,y+1],f'Subtract the second equation from the first: 2y = {2*y}, so y = {y}.')
    m('Inequalities',f'Which inequality is equivalent to −{a}x > {a*(i+1)}?',f'x < −{i+1}',[f'x > −{i+1}',f'x < {i+1}',f'x > {i+1}'],f'Dividing by −{a} reverses the inequality sign, giving x < −{i+1}.')
    m('Exponents',f'For nonzero x, which expression equals x^{i+3} · x^2 ÷ x^{i}?','x^5',['x^6','x^3',f'x^{2*i+5}'],f'Add exponents when multiplying and subtract when dividing: {i+3} + 2 − {i} = 5.')
    w=i+3;l=2*i+5
    m('Geometry: area',f'A rectangle has a width of {w} cm and a perimeter of {2*(w+l)} cm. What is its area in square centimeters?',w*l,[2*(w+l),w+l,w*(l+1)],f'Length = {2*(w+l)}/2 − {w} = {l} cm. Area = {w} × {l} = {w*l} cm².')
    m('Pythagorean theorem',f'A right triangle has legs of length {3*i} and {4*i}. What is the hypotenuse length?',5*i,[7*i,i,25*i],f'The hypotenuse is √(({3*i})² + ({4*i})²) = √{25*i*i} = {5*i}.')
    m('Circles',f'A circle has radius {r}. What is its area?',f'{r*r}π',[f'{2*r}π',f'{r}π',f'{4*r*r}π'],f'Area = πr² = π({r})² = {r*r}π.')
    m('Similar triangles',f'Two triangles are similar. A side of length 3 in the smaller triangle corresponds to a side of length {3*i+3} in the larger triangle. A second side of the smaller triangle is 5. What is the corresponding length in the larger triangle?',5*(i+1),[3*(i+1),5*(i+1)+2,15*(i+1)],f'The scale factor is {3*i+3}/3 = {i+1}. Multiply 5 by {i+1} to get {5*(i+1)}.')
    m('Trigonometry',f'In a right triangle, the side opposite angle θ is {3*i}, the adjacent leg is {4*i}, and the hypotenuse is {5*i}. What is sin θ?','3/5',['4/5','3/4','5/3'],'Sine is opposite divided by hypotenuse: '+f'{3*i}/{5*i} = 3/5.')
    m('Statistics: mean',f'The mean of four numbers is {i+10}. Three of the numbers are {i+6}, {i+8}, and {i+12}. What is the fourth number?',i+14,[i+10,i+12,4*(i+10)],f'Total = 4({i+10}) = {4*(i+10)}. Subtract the three known numbers ({3*i+26}) to obtain {i+14}.')
    m('Probability',f'A box contains {i+2} green, {i+3} yellow, and {i+5} purple counters. One counter is selected at random. What is the probability it is yellow?',f'{i+3}/{3*i+10}',[f'{i+2}/{3*i+10}',f'{i+5}/{3*i+10}',f'{i+3}/{2*i+5}'],f'There are {3*i+10} counters total and {i+3} favorable outcomes, so the probability is {i+3}/{3*i+10}.')
    speed=30+5*i;hours=i+1
    m('Rates',f'A vehicle travels at a constant speed of {speed} miles per hour for {hours} hours. How many miles does it travel?',speed*hours,[speed+hours,speed*(hours+1),speed*(hours-1)],f'Distance = rate × time = {speed} × {hours} = {speed*hours} miles.')
    m('Sequences',f'An arithmetic sequence begins {i+2}, {i+5}, {i+8}, …. What is its 12th term?',i+35,[i+32,i+38,i+41],f'The common difference is 3. Term 12 is the first term plus 11 differences: {i+2} + 11(3) = {i+35}.')
    m('Coordinate geometry',f'What is the midpoint of the segment with endpoints ({i}, {i+2}) and ({i+6}, {i+10})?',f'({i+3}, {i+6})',[f'({i+6}, {i+8})',f'({2*i+6}, {2*i+12})',f'(3, 4)'],f'Average the x-coordinates and y-coordinates: (({i} + {i+6})/2, ({i+2} + {i+10})/2) = ({i+3}, {i+6}).')
# Science: original self-contained studies; students interpret evidence rather than recall facts.
studies=[
('Light and seedling growth','daily light exposure (h)','mean seedling height (cm)',[2,4,6,8],6,3,'Seedlings of the same species were grown in identical pots for 14 days. Soil, water, and temperature were held constant.'),
('Temperature and dissolving','water temperature (°C)','dissolving time (s)',[10,20,30,40],110,-20,'Equal masses of sugar were added to equal volumes of water. Stirring speed and sugar grain size were held constant.'),
('Fertilizer and biomass','fertilizer concentration (mg/L)','mean dry biomass (g)',[0,10,20,30],8,4,'Plants of the same species grew for 21 days with equal light and water. Each group received a different fertilizer concentration.'),
('Salt and germination','salt concentration (g/L)','number germinated out of 100',[0,2,4,6],90,-15,'Groups of 100 seeds of the same species were given equal volumes of solution and kept at the same temperature for 7 days.'),
('Ramp angle and travel','ramp angle (degrees)','distance traveled after leaving ramp (cm)',[10,20,30,40],20,15,'The same cart was released without a push from the top of the same ramp. Only ramp angle changed; the floor surface stayed the same.'),
('Insulation and cooling','insulation thickness (mm)','temperature after 10 min (°C)',[0,5,10,15],35,8,'Identical cups began with equal volumes of water at 80°C. Room temperature was 20°C. Different thicknesses of one insulating material surrounded the cups.'),
('Water depth and light','water depth (m)','light intensity (relative units)',[1,2,3,4],100,-20,'A sensor measured light at several depths in a clear tank. The same lamp stayed fixed above the tank, and water clarity did not change.'),
('Enzyme amount and rate','enzyme concentration (mg/mL)','initial reaction rate (units/min)',[1,2,3,4],12,6,'Researchers varied enzyme concentration while keeping substrate in excess. Temperature, pH, and total solution volume stayed constant.'),
('Surface area and reaction','exposed surface area (cm²)','initial gas production (mL/min)',[2,4,6,8],10,10,'Equal masses of the same solid reacted with excess acid. Acid concentration and temperature were held constant; the solid pieces had different exposed surface areas.'),
('Wind and evaporation','wind speed (m/s)','water lost in 1 h (g)',[0,1,2,3],4,3,'Identical open dishes held equal initial masses of water. Air temperature, humidity, and exposed water surface area stayed constant.')]
for title,xlabel,ylabel,xs,base,step,method in studies:
    ys=[base+j*step for j in range(4)]
    context=f'{title}. {method} Three trials were run per condition; the table shows their means. Assume the trend is approximately linear only within the tested range.'
    table={'headers':[xlabel,ylabel],'rows':list(map(list,zip(xs,ys)))}
    def s(skill,p,a,w,why):add('science',skill,p,a,w,why,context,table)
    s('Read a data table',f'At {xlabel} = {xs[2]}, what value was measured for {ylabel}?',ys[2],[ys[0],ys[1],ys[3]],f'The row for {xs[2]} lists {ys[2]} in the measured-response column.')
    s('Identify a trend',f'As {xlabel} increased across the tested range, how did {ylabel} change?', 'It increased.' if step>0 else 'It decreased.', ['It decreased.' if step>0 else 'It increased.','It remained constant.','It first increased, then decreased.'],f'The values progress from {ys[0]} to {ys[3]}, with each successive value '+('higher.' if step>0 else 'lower.'))
    s('Compare measurements',f'What is the magnitude of the difference in {ylabel} between {xlabel} = {xs[0]} and {xs[3]}?',abs(3*step),[abs(step),abs(2*step),sum([ys[0],ys[3]])],f'Take the absolute difference: |{ys[3]} − {ys[0]}| = {abs(3*step)}.')
    mid=(xs[1]+xs[2])/2;ym=(ys[1]+ys[2])/2
    s('Interpolate',f'Based on the table, what is the best estimate of {ylabel} at {xlabel} = {mid:g}?',f'{ym:g}',[str(ys[1]),str(ys[2]),str(ys[3])],f'{mid:g} is halfway between {xs[1]} and {xs[2]}. The estimated response is halfway between {ys[1]} and {ys[2]}: {ym:g}.')
    s('Experimental design','Which variable did the researchers deliberately change?',xlabel,[ylabel,'The number of trials per condition','Both table variables were held constant'],f'The researchers varied {xlabel} and measured the resulting {ylabel}.')
    s('Experimental design','Which variable is the measured response?',ylabel,[xlabel,'The number of trials per condition','The study title'],f'The second column, {ylabel}, records the outcome measured in response to the manipulated variable.')
    s('Evaluate a claim',f'A student claims that changing {xlabel} had no effect on {ylabel} in these trials. Which evidence most directly challenges this claim?',f'The mean response changed from {ys[0]} to {ys[3]} across the tested conditions.', ['Three trials were conducted at each condition.','Only four conditions were tested.','The table uses two column headings.'],f'The change from {ys[0]} to {ys[3]} directly contradicts a claim of an unchanged measured response.')
    s('Calculate a rate of change',f'By how much did {ylabel} change, including the sign, for each increase of {xs[1]-xs[0]} in {xlabel}?',f'{step:+}',[f'{-step:+}',f'{2*step:+}',f'{3*step:+}'],f'Adjacent rows are spaced by {xs[1]-xs[0]} in the first column. The second column changes by {ys[1]} − {ys[0]} = {step:+}.')
    s('Reliability','Why did the researchers run three trials per condition?', 'To reduce the influence of random variation on the mean.', ['To guarantee that the hypothesis was correct.','To eliminate the need to control other variables.','To prove the trend holds at all untested values.'],'Repeated trials help estimate a typical result and reduce the effect of random variation. They do not guarantee a conclusion or justify unlimited extrapolation.')
    s('Limits of evidence',f'Which conclusion is best supported by this study?',f'Within the tested range, higher {xlabel} was associated with '+('higher ' if step>0 else 'lower ')+ylabel+'.', ['The same pattern must hold at every possible value.','Changing any controlled variable would have no effect.','Every individual trial must have equaled its group mean.'],'The table supports a relationship within the measured conditions. It does not establish results at all untested values or require every trial to equal the mean.')
# Conflicting viewpoints: two explicitly defined candidate mechanisms per context.
views=[
('Algal growth','nutrient concentration','water temperature','adding nutrients without warming the water','warming the water without adding nutrients','algal growth rate'),
('Seed dormancy','exposure to light','exposure to cold','exposing seeds to light without cooling them','cooling seeds while keeping them in darkness','germination percentage'),
('Metal corrosion','salt concentration','oxygen concentration','adding salt while keeping oxygen constant','adding oxygen while keeping salt constant','corrosion rate'),
('Insect activity','air temperature','light intensity','warming the air while holding light constant','increasing light while holding air temperature constant','insect movement rate'),
('Pond oxygen','water movement','number of aquatic plants','increasing water movement without adding plants','adding plants without changing water movement','dissolved oxygen concentration'),
('Crystal growth','solute concentration','cooling rate','increasing solute concentration at a fixed cooling rate','increasing cooling rate at a fixed solute concentration','crystal growth rate'),
('Soil water retention','clay proportion','organic matter proportion','increasing clay while keeping organic matter constant','increasing organic matter while keeping clay constant','mass of water retained'),
('Leaf water loss','wind speed','air temperature','increasing wind speed at a fixed air temperature','increasing air temperature at a fixed wind speed','leaf water loss rate'),
('Bacterial growth','nutrient availability','temperature','adding nutrients at a fixed temperature','raising temperature at fixed nutrient availability','bacterial growth rate'),
('Sediment transport','water speed','water volume','increasing water speed at fixed water volume','increasing water volume at fixed water speed','mass of sediment transported')]
for title,a,b,ta,tb,response in views:
    context=f'{title}. Two researchers propose models for {response} over a specified, moderate range of conditions. Model A: increasing {a} increases {response}; changing {b} has no effect. Model B: increasing {b} increases {response}; changing {a} has no effect. All predictions apply only within this range; all other conditions are held constant.'
    def v(skill,p,ans,w,why):add('science',skill,p,ans,w,why,context)
    four=['Model A only','Model B only','Both models','Neither model']
    def which(p,ans,why):v('Compare models',p,ans,[x for x in four if x!=ans],why)
    which(f'Which model predicts increased {response} after {ta}?','Model A only',f'Only Model A assigns a positive effect to {a}. Model B predicts no effect from this change.')
    which(f'Which model predicts increased {response} after {tb}?','Model B only',f'Only Model B assigns a positive effect to {b}. Model A predicts no effect from this change.')
    which(f'Which model predicts increased {response} when both {a} and {b} increase?','Both models',f'Model A predicts an increase because {a} increases; Model B predicts an increase because {b} increases.')
    which(f'Which model predicts unchanged {response} when only {a} increases?','Model B only',f'Model B states that changing {a} has no effect.')
    which(f'Which model predicts unchanged {response} when only {b} increases?','Model A only',f'Model A states that changing {b} has no effect.')
    v('Distinguish hypotheses','Which experiment most directly distinguishes the two models?',f'Increase {a} while holding {b} constant.',[f'Increase {a} and {b} simultaneously.','Repeat the baseline condition without changing anything.','Change several uncontrolled conditions simultaneously.'],f'The models predict different outcomes when {a} alone changes. Changing both together would make both predict an increase.')
    v('Evaluate evidence',f'In a controlled experiment, {ta} caused a reproducible increase in {response}. How does this result compare with the models?','It supports Model A and conflicts with Model B.',['It supports Model B and conflicts with Model A.','It conflicts with both models.','It cannot distinguish the models because both predict an increase.'],f'Model A predicts this increase, whereas Model B predicts no change when only {a} changes.')
    v('Evaluate evidence',f'In a controlled experiment, {tb} caused a reproducible increase in {response}. How does this result compare with the models?','It supports Model B and conflicts with Model A.',['It supports Model A and conflicts with Model B.','It conflicts with both models.','It cannot distinguish the models because both predict an increase.'],f'Model B predicts this increase, whereas Model A predicts no change when only {b} changes.')
    which(f'Experiments find that increasing either {a} alone or {b} alone increases {response}. Which model, as stated, accounts for both findings?','Neither model','Each model claims that one of the two variables has no effect. Separate positive effects of both variables contradict that part of each model.')
    v('Control variables',f'Why must {b} be held constant when testing the effect of {a}?',f'To avoid confusing the effect of {a} with a possible effect of {b}.',['To guarantee that Model A is true.','To make repeated measurements unnecessary.',f'To prevent measuring {response}.'],'Holding other potentially influential factors constant helps isolate the variable being tested; it does not predetermine which model is correct.')
from expansion import extend
extend(add, banks)
for subject,qs in banks.items():
    assert len(qs)==400,(subject,len(qs))
    assert len(set((q.get('context',''),q['prompt']) for q in qs))==400
(out/'bank.js').write_text('// Original ACT-style practice. Not official ACT material. Generated by tools/build-bank.py.\n(function () {\n  "use strict";\nvar bank = '+json.dumps(banks,ensure_ascii=False,indent=2).replace('–','-').replace('—','-')+';\nif(typeof module === "object" && module.exports) module.exports = bank;\nelse {\n  var root = document.querySelector(\'[data-zsa-activity="act-question-generator"]\');\n  if (root) root.addEventListener("zsa-generator-bank", function (event) { event.detail.receive(bank); });\n}\n})();\n')
print({s:len(q) for s,q in banks.items()})
