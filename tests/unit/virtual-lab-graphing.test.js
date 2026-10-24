"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../../virtual-lab-graphing/model.js");
const pts = rows => rows.map(([x,y]) => ({x,y}));
const near = (actual, expected, tolerance=1e-10) => assert.ok(Math.abs(actual-expected)<tolerance, actual+" vs "+expected);
test("least-squares results agree with hand-computed noisy data", () => {
  // x mean 2, y mean 3, Sxx 10, Sxy 5, Syy 4.
  const fit=M.fit(pts([[0,2],[1,2],[2,4],[3,3],[4,4]]));
  near(fit.slope,.5);near(fit.intercept,2);near(fit.r2,.625);near(fit.predict(2),3);
});
test("negative slopes, constant y, insufficient points and vertical data", () => {
  const negative=M.fit(pts([[0,20],[3,12.5],[8,0]]));near(negative.slope,-2.5);near(negative.intercept,20);near(negative.r2,1);
  const constant=M.fit(pts([[-2,4],[0,4],[8,4]]));assert.equal(constant.slope,0);assert.equal(constant.r2,null);assert.equal(constant.predict(10),4);
  assert.match(M.fit([]).error,/two/);assert.match(M.fit(pts([[2,3]])).error,/two/);
  assert.match(M.fit(pts([[2,3],[2,4]])).error,/same/);
  assert.ok(!M.fit(pts([[1,2],[1,3],[2,4]])).error);
});
test("centering and scaling keep large-offset and tiny data usable", () => {
  const f=M.fit(pts([[1e12,1],[1e12+1,3],[1e12+2,5]]));near(f.slope,2);near(f.predict(1e12+1.5),4);
  const tiny=M.fit(pts([[0,0],[1e-90,2e-90],[2e-90,4e-90]]));near(tiny.slope,2);near(tiny.r2,1);
  const large=M.fit(pts([[-1e100,-1e100],[0,0],[1e100,1e100]]));near(large.slope,1);near(large.r2,1);
});
test("numbers are strict and incomplete rows never become zeros", () => {
  for(const s of ["", " ", "2cm", "0x10", "Infinity", "NaN", "1e101", "1,000", "1e-101", "1e-400"]) assert.equal(M.number(s),null,s);
  for(const [s,n] of [["0",0],["−2.5",-2.5],[".25",.25],["1.2e-3",.0012],["1e100",1e100]]) assert.equal(M.number(s),n);
  const p=M.pairs([["0","0"],["",""],["1",""],["x","3"],["2","4"]]);assert.deepEqual(p.errors,[3,4]);assert.equal(p.points.length,2);assert.equal(p.points[0].x,0);
});
test("automatic axes use equal steps and contain every measurement", () => {
  for(const values of [[],[0],[5],[-5],[-9,-2],[-3,4],[1e-90,3e-90],[1e90,3e90]]) for(const zero of [true,false]) {
    const axis=M.axis(values,zero);assert.ok(Number.isFinite(axis.min));assert.ok(axis.max>axis.min);assert.ok(axis.ticks.length>=2&&axis.ticks.length<=13);
    for(const value of values) assert.ok(value>=axis.min&&value<=axis.max);
    axis.ticks.slice(1).forEach((value,i)=>near((value-axis.ticks[i])/axis.step,1,1e-8));
    if(zero)assert.ok(axis.min<=0&&axis.max>=0);
  }
  const offset=M.axis([1e12,1e12+1],false);
  assert.equal(new Set(offset.ticks.map(n=>M.tickFormat(n,offset.step))).size,offset.ticks.length);
});
test("CSV imports headers, quotes, Unicode units and spreadsheet tabs", () => {
  assert.deepEqual(M.parse('\uFEFF"Time (s)","Temperature (°C)"\r\n0,20\r\n1,35\r\n').labels,["Time (s)","Temperature (°C)"]);
  assert.deepEqual(M.parse("x\ty\n-1\t2e-3\n0\t4").rows,[["-1","2e-3"],["0","4"]]);
  assert.deepEqual(M.parse('"A, changed","B ""measured"""\n1,2').labels,["A, changed",'B "measured"']);
  assert.deepEqual(M.splitLabel("Temperature (°C)"),{name:"Temperature",unit:"°C"});
});
test("invalid imports fail as a whole and enforce the row limit", () => {
  for(const text of ["", "x,y", "1,2,3", "1,2\n3,no", "x,y\n,2", '"x,y\n1,2', '"a"oops,b\n1,2'])assert.throws(()=>M.parse(text));
  assert.equal(M.parse(Array.from({length:500},(_,i)=>i+","+i).join("\n")).rows.length,500);
  assert.throws(()=>M.parse(Array.from({length:501},(_,i)=>i+","+i).join("\n")),/500/);
});
test("CSV round-trip retains numeric precision and labels", () => {
  const data=pts([[0,0],[-.001234567890123,9e80]]), labels=['Time (s)','Value, measured'];
  const parsed=M.parse(M.csv(data,labels));assert.deepEqual(parsed.labels,labels);
  assert.deepEqual(parsed.rows.map(r=>r.map(Number)),data.map(p=>[p.x,p.y]));
});
