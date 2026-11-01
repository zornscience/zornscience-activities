(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="gravimetric-lab"]');
  if (!root) return;
  function el(id) { return root.querySelector('#' + id); }
  var i18n;
  root.dispatchEvent(new CustomEvent('zsa:request-i18n', {detail:{receive:function (api) { i18n = api; }}}));
  // English is the fallback; data.js holds the Spanish for each full sentence template.
  function t(text, values) { return i18n ? i18n.text(text, values) : text.replace(/\{(\w+)\}/g, function (m, k) { return values && values[k] !== undefined ? values[k] : m; }); }
  var action = el('action'), index = 0, busy = false, timer = null, trial = 0;
  var carbonate, solid, crucible = 18.642, paper = 0.598;
  function mass(n) { el('balance-reading').textContent = n.toFixed(3) + ' g'; el('balance-display').textContent = n.toFixed(3) + ' g'; }
  function crucibleAt(position) {
    var transforms={burner:'translate(0 0)',oven:'translate(541 0)',cool:'translate(134 140)',balance:'translate(-167 110)'};
    el('crucible-body').setAttribute('transform',transforms[position]||transforms.burner);
  }
  function show(id, visible) { el(id).setAttribute('visibility', visible ? 'visible' : 'hidden'); }
  var steps = [
    [0,'Prepare the crucible','A clean crucible can still carry water. Dry it before measuring its empty mass.','Dry crucible in oven','3 minutes in the oven','The empty crucible is clean but not yet dry.','oven',function () { crucibleAt('oven'); }],
    [0,'Cool in the desiccator','Use crucible tongs to move the hot crucible into a dry, enclosed atmosphere.','Cool the crucible','Cooling is accelerated','The crucible is dry and hot. Never weigh a hot vessel.','cool',function () { crucibleAt('cool'); }],
    [0,'Weigh the empty crucible','Place the cooled, dry crucible on the analytical balance.','Weigh empty crucible','Read the balance to 0.001 g','The crucible has cooled to room temperature.','weigh',function () { crucibleAt('balance'); mass(crucible); }],
    [0,'Add the unknown','Use a dry scoopula to transfer about 2 g of the unknown Group 1 carbonate into the crucible.','Add unknown carbonate','Sample mass is established after drying','The balance shows the mass of the empty crucible.','add',function () { crucibleAt('burner'); show('crucible-powder',true); mass(0); }],
    [0,'Drive off moisture','Gently heat the crucible on a clay triangle over the Bunsen burner. Hygroscopic samples can absorb water from air.','Heat over the burner','5 minutes of gentle heating','A white carbonate sample sits in the crucible.','burn',function () { show('flame-shape',false); }],
    [0,'Cool the dry sample','Move the crucible with tongs into the desiccator before weighing.','Cool in desiccator','Cooling is accelerated','The burner is off. The crucible and sample are still hot.','cool',function () { crucibleAt('cool'); }],
    [0,'Weigh crucible + sample','The difference between this reading and the empty crucible mass gives the dry carbonate mass.','Weigh crucible + carbonate','The sample is now dry and cool','The sample is ready for an accurate mass measurement.','weigh',function () { crucibleAt('balance'); mass(crucible+2); }],
    [1,'Make the carbonate solution','Transfer the sample into the 400 mL beaker. Use two 100 mL portions of deionized water, then stir to dissolve.','Transfer, add water & stir','200 mL deionized water','The dry sample can now be transferred quantitatively.','stir',function () { crucibleAt('burner'); show('balance-object',false); show('crucible-powder',false); show('solution',true); mass(0); }],
    [1,'Form a precipitate','Add 125 mL of 0.200 M calcium chloride. Calcium ions bind carbonate ions into insoluble calcium carbonate.','Add calcium chloride','0.0250 mol CaCl₂, in excess','The carbonate solution is clear and colorless.','stir',function () { show('cloud',true); }],
    [1,'Let the solid settle','Leave the mixture undisturbed overnight so the white precipitate settles to the bottom.','Allow overnight settling','One night passes in a few seconds','The mixture has turned cloudy with suspended CaCO₃.','settle',function () { show('cloud',false); show('sediment',true); }],
    [2,'Weigh dry filter paper','Measure the dry filter paper by itself before wetting it or collecting any precipitate.','Weigh filter paper','Dry filter paper only','A white sediment sits beneath the clear supernatant.','weigh',function () { show('balance-object',false); show('balance-paper',true); mass(paper); }],
    [2,'Prepare vacuum filtration','Clamp the side-arm flask, connect the vacuum, fit the Büchner funnel, and seat the paper with a little deionized water.','Assemble & wet the paper','Vacuum on; paper sealed against funnel','The balance shows the mass of dry filter paper.','filter',function () { show('filter-paper',true); show('balance-paper',false); mass(0); }],
    [2,'Decant the clear liquid','Guide the liquid down a stirring rod into the funnel. Keep the liquid below the funnel rim and leave about 10 mL in the beaker.','Decant the supernatant','Pour slowly to avoid splashing','The filter paper is seated in the Büchner funnel.','filter',function () { show('solution',false); show('filtrate',true); }],
    [2,'Transfer the precipitate','Swirl the remaining liquid to suspend the solid. Transfer it, then rinse the beaker with deionized water into the funnel.','Swirl, transfer & rinse','Recover the solid left on the glass','Most liquid has passed through; the solid remains in the beaker.','filter',function () { show('sediment',false); show('filter-cake',true); }],
    [2,'Wash the solid: 1 of 3','Rinse the collected solid with deionized water to remove soluble salts. Allow the wash to drain.','First wash','Deionized water; vacuum on','The white CaCO₃ is collected on the filter paper.','filter',function () {}],
    [2,'Wash the solid: 2 of 3','Repeat with fresh deionized water. Dissolved calcium chloride and metal chloride pass into the filtrate.','Second wash','Deionized water; vacuum on','The first wash has drained through the solid.','filter',function () {}],
    [2,'Wash the solid: 3 of 3','Give the precipitate a final wash and let the remaining liquid drain.','Third wash','Deionized water; vacuum on','The second wash has drained. One rinse remains.','filter',function () {}],
    [3,'Begin drying','Switch off the vacuum. Carefully move the filter paper and solid onto a watch glass and place it in the drying oven.','Transfer to oven & dry','15 minutes of drying','The washed precipitate is wet and would give a high mass.','oven',function () { show('filter-cake',false); show('filter-paper',false); show('oven-sample',true); }],
    [3,'Break up the solid','Remove the watch glass safely. Use a scoopula to break the CaCO₃ into smaller particles, then return it to the oven.','Break up & dry again','5 additional minutes','Smaller pieces allow trapped water to escape more easily.','oven',function () {}],
    [3,'Cool and weigh','Cool before weighing. Transfer only the filter paper and solid to the balance; the watch glass is excluded.','Cool & weigh paper + solid','First precipitate weighing','The solid looks dry, but appearance alone cannot confirm it.','weigh',function () { show('oven-sample',false); show('balance-paper',true); show('balance-solid',true); mass(paper+solid+0.032); }],
    [3,'Check for constant mass','Dry for another 5 minutes, cool, and weigh again. A lower reading means water was still present.','Dry, cool & reweigh','5 minutes in the oven, then cooling','The first weighing may still include residual water.','oven',function () { show('balance-paper',true); show('balance-solid',true); mass(paper+solid); }],
    [3,'Confirm constant mass','Repeat one more drying, cooling, and weighing cycle. Two consecutive matching readings establish constant mass at this balance resolution.','Repeat the drying cycle','5 minutes in the oven, then cooling','The mass decreased as the remaining moisture evaporated.','oven',function () { show('balance-paper',true); show('balance-solid',true); mass(paper+solid); }],
    [3,'The evidence is ready','The final reading matches the previous reading. The precipitate is dry to constant mass.','Inspect the result','No measurements are stored','Two consecutive balance readings agree to 0.001 g.','finish',function () { el('result').hidden=false; el('result-text').textContent=t('Dry carbonate: 2.000 g. Subtract the filter paper mass (0.598 g) from the final balance reading to find the CaCO₃ mass. Each mole of CaCO₃ represents one mole of the original carbonate.'); }]
  ];
  function render() {
    var s=steps[index];
    el('step-counter').textContent=t('STEP {n} / {total}',{n:String(index+1).padStart(2,'0'),total:steps.length});
    el('step-title').textContent=t(s[1]); el('step-detail').textContent=t(s[2]); action.textContent=t(s[3]);
    el('time-note').textContent=t(s[4]); el('observation').textContent=t(s[5]);
    el('scene-caption').textContent=t(s[5]); el('bench-state').textContent=t(['PREPARE THE SAMPLE','PRECIPITATE CaCO₃','VACUUM FILTRATION','DRY TO CONSTANT MASS'][s[0]]);
    root.querySelectorAll('.phases li').forEach(function (li,i) { li.classList.toggle('current',i===s[0]); li.classList.toggle('done',i<s[0]); });
  }
  action.addEventListener('click',function () {
    if (busy) return;
    var s=steps[index]; busy=true; action.disabled=true; action.textContent=t('In progress…');
    root.classList.add('busy'); root.classList.toggle('heating',s[6]==='oven'); root.classList.toggle('stirring',s[6]==='stir'); root.classList.toggle('filtering',s[6]==='filter'); root.classList.toggle('measuring',s[6]==='weigh');
    if(s[6]==='burn') show('flame-shape',true);
    if(s[6]==='oven' && index>=17) { show('oven-sample',true); show('balance-paper',false); show('balance-solid',false); }
    if(index===0) crucibleAt('oven');
    if(s[6]==='cool') crucibleAt('cool');
    el('observation').textContent=t(s[4])+'.'; el('scene-caption').textContent=t(s[3])+'…';
    timer=setTimeout(function () {
      s[7](); root.classList.remove('busy','heating','stirring','filtering','measuring');
      if(index>=19) show('oven-sample',false);
      busy=false; action.disabled=false;
      if(index<steps.length-1) { index++; render(); }
      else { action.hidden=true; el('observation').textContent=t('Constant mass confirmed. Use the balance evidence to identify the unknown.'); el('scene-caption').textContent=t('Analysis complete. A dry precipitate, a constant mass, and evidence for your unknown.'); }
    }, s[6]==='finish'?150:s[6]==='weigh'?750:1800);
  });
  el('reveal').addEventListener('click',function () {
    el('identity').textContent=t('{name} ({formula}). The model yields {mass} g CaCO₃; the inferred molar mass is approximately {molar} g/mol.',{name:t(carbonate.name),formula:carbonate.formula,mass:solid.toFixed(3),molar:carbonate.molar.toFixed(2)});
    el('reveal').hidden=true;
  });
  function reset() {
    clearTimeout(timer); trial++; index=0; busy=false;
    carbonate=trial%2?{name:'Sodium carbonate',formula:'Na₂CO₃',molar:105.99}:{name:'Potassium carbonate',formula:'K₂CO₃',molar:138.21};
    solid=2/carbonate.molar*100.09;
    ['oven-sample','crucible-powder','flame-shape','balance-object','solution','cloud','sediment','filtrate','filter-paper','filter-cake','balance-paper','balance-solid'].forEach(function (id) { show(id,false); });
    crucibleAt('burner'); mass(0); root.classList.remove('busy','heating','stirring','filtering','measuring');
    el('sample').textContent=t('Unknown {letter}',{letter:String.fromCharCode(65+(trial-1)%26)}); el('identity').textContent=''; el('result').hidden=true; el('reveal').hidden=false; action.hidden=false; action.disabled=false; render();
  }
  reset();
}());
