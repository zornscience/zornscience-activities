'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const bank = require('../../act-question-generator/bank.js');
const createDeck = require('../../act-question-generator/deck.js');
test('three independent banks contain 400 complete, distinct question contexts each', () => {
  assert.deepEqual(Object.keys(bank), ['english', 'math', 'science']);
  const ids = new Set();
  for (const [subject, questions] of Object.entries(bank)) {
    assert.equal(questions.length, 400);
    const stems = new Set();
    for (const q of questions) {
      assert.ok(!ids.has(q.id)); ids.add(q.id);
      assert.ok(q.id.startsWith(subject + '-'));
      assert.equal(q.choices.length, 4);
      assert.equal(new Set(q.choices.map(s => s.trim())).size, 4, q.id);
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, q.id);
      assert.ok(q.prompt && q.skill && q.explanation.trim().length > 0, q.id);
      stems.add((q.context || '') + '\n' + q.prompt);
      if (q.table) {
        assert.equal(q.table.headers.length, 2);
        assert.equal(q.table.rows.length, 4);
        q.table.rows.forEach(row => assert.equal(row.length, 2));
      }
    }
    assert.equal(stems.size, 400);
  }
  assert.equal(ids.size, 1200);
});
test('subject switching preserves all queues, with no repeat across each complete pass', () => {
  const original = JSON.stringify(bank);
  const deck = createDeck(bank);
  for (let cycle = 1; cycle <= 3; cycle++) {
    const seen = {english: new Set(), math: new Set(), science: new Set()};
    for (let count = 1; count <= 400; count++) {
      for (const subject of Object.keys(bank)) {
        const draw = deck.draw(subject);
        assert.equal(draw.seen, count); assert.equal(draw.cycle, cycle);
        assert.ok(!seen[subject].has(draw.question.id)); seen[subject].add(draw.question.id);
      }
    }
    Object.values(seen).forEach(ids => assert.equal(ids.size, 400));
  }
  assert.equal(JSON.stringify(bank), original);
});
test('cycle boundaries never immediately repeat, even with deterministic shuffle', () => {
  const deck = createDeck({a: [{id: '1'}, {id: '2'}]}, () => 0.999);
  let previous;
  for (let i = 0; i < 20; i++) {
    const id = deck.draw('a').question.id;
    assert.notEqual(id, previous); previous = id;
  }
  assert.throws(() => deck.draw('toString'), /Unknown subject/);
  assert.throws(() => createDeck({empty: []}).draw('empty'), /Empty/);
});
test('all 200 math answer keys satisfy an independent numerical reference', () => {
  for (const q of bank.math.slice(0,200)) {
    const i = Math.floor((Number(q.id.split('-')[1]) - 1) / 20) + 1;
    const a = i + 2, b = 2 * i + 1;
    const expected = {
      'Linear equations': i + 3, Percents: (40 + 20*i)*(1-(10+5*i)/100), Ratios: 3*(i+3),
      Slope: i+1, 'Linear functions': a*(i+4)-b, Quadratics: i+2,
      Factoring: `(x + ${i})(x + ${i+3})`, 'Systems of equations': i+1,
      Inequalities: `x < −${i+1}`, Exponents: 'x^5',
      'Geometry: area': (i+3)*(2*i+5), 'Pythagorean theorem': Math.hypot(3*i,4*i),
      Circles: `${(i+2)**2}π`, 'Similar triangles': 5*(i+1), Trigonometry: '3/5',
      'Statistics: mean': 4*(i+10)-((i+6)+(i+8)+(i+12)),
      Probability: `${i+3}/${3*i+10}`, Rates: (30+5*i)*(i+1), Sequences: (i+2)+11*3,
      'Coordinate geometry': `(${i+3}, ${i+6})`
    }[q.skill];
    if (typeof expected === 'number') assert.ok(Math.abs(Number(q.choices[q.answer])-expected)<1e-8, q.id);
    else assert.equal(q.choices[q.answer], expected, q.id);
  }
});
test('science numerical answers follow the tables provided to students', () => {
  for (const q of bank.science.slice(0,200).filter(q => q.table)) {
    const rows = q.table.rows;
    const expected = {
      'Read a data table': rows[2][1],
      'Compare measurements': Math.abs(rows[3][1]-rows[0][1]),
      Interpolate: (rows[1][1]+rows[2][1])/2,
      'Calculate a rate of change': rows[1][1]-rows[0][1]
    }[q.skill];
    if (expected !== undefined) assert.equal(Number(q.choices[q.answer]), expected, q.id);
  }
});
test('each subject adds 100 standard and 100 harder items, with normalized duplicate checks', () => {
  for (const qs of Object.values(bank)) {
    const added=qs.slice(200);
    assert.equal(added.length,200);
    assert.equal(added.filter(q=>q.difficulty==='hard').length,100);
    assert.equal(added.filter(q=>q.difficulty==='standard').length,100);
    const normalized=qs.map(q=>((q.context||'')+' '+q.prompt).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim());
    assert.equal(new Set(normalized).size,400);
  }
});
test('new math keys solve their stated constraints', () => {
  for(const q of bank.math.slice(200)) {
    const i=Math.floor((Number(q.id.split('-')[1])-201)/20)+1,n=i+4;
    const value=q.choices[q.answer];
    const v=Number(value), close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,q.id);
    switch(q.skill) {
      case 'Absolute-value equations':close(v,(n-3)+(n+3));break;
      case 'Weighted mean':close(v*(n+2*n),12*n+18*2*n);break;
      case 'Compound probability':{const [a,b]=value.split('/').map(Number);close(a/b,(n/(2*n+2))**2);break;}
      case 'Unit conversion':close(v/n,150/60);break;
      case 'Exponential growth':close(v/n,2**4);break;
      case 'Triangle angle sums':close(v+(v+n)+(v+2*n),180);break;
      case 'Volume scaling':assert.equal(value,`${(2*n)**3/n**3}:1`);break;
      case 'Function composition':close(v,2*((n+5)-3)+n);break;
      case 'Median with an unknown':close(v,n+3);assert.ok(v>=5&&v<=n+10);break;
      case 'Coordinate transformations':assert.equal(value,`(-${n}, ${-(n+2)+3})`);break;
      case 'Rational equations and domain':assert.notEqual(v,n);close((v*v-n*n)/(v-n),3*n);break;
      case 'Quadratic discriminant':close((2*n)**2-4*v,0);break;
      case 'Inverse functions':close((3*v-n)/2,n+3);break;
      case 'Conditional probability':{const [a,b]=value.split('/').map(Number);close(a/b,n/(n+n-1));break;}
      case 'Mixture equations':close((0.6*v+0.2*n)/(v+n),0.4);break;
      case 'Combined work rates':close(v/(3*n)+v/(6*n),1);break;
      case 'Geometric series':close(v,[0,1,2,3].reduce((sum,p)=>sum+n*100/2**p,0));break;
      case 'Logarithmic equations':close(Math.log2(v-n)+Math.log2(4),5);break;
      case 'Quadratic optimization':{const areas=Array.from({length:4*n+1},(_,j)=>{const w=j/2;return w*(4*n-2*w);});close(v,Math.max(...areas));break;}
      case 'Parameter constraints':close(v/3,4/2);assert.notEqual((2*n+1)/n,2);break;
      default:assert.fail('Unverified family '+q.skill);
    }
  }
});
test('new science calculations follow the four supplied treatment means', () => {
  const numericSkills=new Set(['Single-factor differences','Outcome range','Interactions','Additive model predictions','Model residuals','Comparative ratios','Replication units']);
  for(const q of bank.science.slice(200)) {
    if(!numericSkills.has(q.skill))continue;
    const [baseline,a,b,ab]=q.table.rows.map(row=>row[1]);
    let expected;
    if(q.skill==='Single-factor differences')expected=q.prompt.includes('adding A')?a-baseline:b-baseline;
    if(q.skill==='Outcome range')expected=Math.max(baseline,a,b,ab)-Math.min(baseline,a,b,ab);
    if(q.skill==='Interactions')expected=q.prompt.startsWith('How large')?ab-b:(ab-b)-(a-baseline);
    if(q.skill==='Additive model predictions')expected=a+b-baseline;
    if(q.skill==='Model residuals')expected=ab-(a+b-baseline);
    if(q.skill==='Comparative ratios')expected=(ab-b)/(a-baseline);
    if(q.skill==='Replication units')expected=20;
    const choice=q.choices[q.answer],parts=choice.split('/').map(Number),value=parts.length===2?parts[0]/parts[1]:Number(choice);
    assert.ok(Math.abs(value-expected)<1e-8,q.id);
  }
});
