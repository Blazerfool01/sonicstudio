import test from 'node:test'
import assert from 'node:assert/strict'
import { STUDIO_VIEWS, CREATE_TOOLS, historicalTrack, playbackViewActive } from '../src/lib/studioNavigation.ts'
import { createProject, createProjectTrack, addProjectTrack, attachIngredient, parseProjects, writeProjects, PROJECT_STORAGE_KEY } from '../src/lib/studioProject.ts'
import { addComparison, createComparison } from '../src/lib/trackComparison.ts'
const project = () => attachIngredient(createProject('Release'), 'mood', { label: 'Serene', sourceId: null, selections: [{ moodId: 'serene', weight: 100 }] })
test('final workflow has four destinations and secondary ingredient editing access', () => {
 assert.deepEqual(STUDIO_VIEWS.map(v => v.id), ['create','tracks','compare','visualise'])
 assert.deepEqual(CREATE_TOOLS.map(v => v.id), ['overview','genre','vocal','mood'])
})
test('playback remains active across listening destinations and inactive in editing destinations', () => {
 for (const v of STUDIO_VIEWS) assert.equal(playbackViewActive(v.id), ['compare','visualise'].includes(v.id))
})
test('historical handoff resolves the exact track even when records share session audio', () => {
 const p=project(), a=createProjectTrack(p,'A'), b=createProjectTrack(p,'B')
 const links={[a.id]:'shared',[b.id]:'shared'}
 assert.equal(historicalTrack([a,b],a.id,links,'shared'),a)
 assert.equal(historicalTrack([a,b],b.id,links,'shared'),b)
 assert.deepEqual(historicalTrack([a,b],a.id,links,'shared').creationSnapshot.mood,p.mood)
})
test('standalone selection, removal and stale handoff never inherit historical mood', () => {
 const t=createProjectTrack(project(),'A'), links={[t.id]:'local'}
 for (const [records,id,selected] of [[[t],null,'local'],[[t],t.id,'other'],[[],t.id,'local'],[[t],t.id,null]]) assert.equal(historicalTrack(records,id,links,selected),undefined)
})
test('workflow navigation leaves current identity, track history and comparisons unchanged', () => {
 let p=project();p=addProjectTrack(p,createProjectTrack(p,'A'));p=addProjectTrack(p,createProjectTrack(p,'B'));p=addComparison(p,createComparison(p,p.tracks[0].id,p.tracks[1].id))
 const before=structuredClone(p)
 for(const v of STUDIO_VIEWS){playbackViewActive(v.id);historicalTrack(p.tracks,p.tracks[0].id,{[p.tracks[0].id]:'local'},'local')}
 assert.deepEqual(p,before)
 const storage={setItem(key,value){assert.equal(key,PROJECT_STORAGE_KEY);this.value=value}}
 writeProjects(storage,[{...p,view:'visualise',returnView:'compare'}],p.id)
 const restored=parseProjects(storage.value);assert.equal(restored.activeId,p.id);assert.deepEqual(restored.projects,[p]);assert.ok(!storage.value.includes('returnView'))
})
for(const stage of [1,2,3])test(`Stage ${stage} schema-1 projects reopen without migration or reset`,()=>{
 const p=project();if(stage===1){delete p.tracks;delete p.comparisons}else if(stage===2)delete p.comparisons
 const parsed=parseProjects(JSON.stringify({schemaVersion:1,activeId:p.id,projects:[p]}))
 assert.equal(parsed.activeId,p.id);assert.deepEqual(parsed.projects[0].mood,p.mood);assert.deepEqual(parsed.projects[0].tracks,[]);assert.deepEqual(parsed.projects[0].comparisons,[])
})
