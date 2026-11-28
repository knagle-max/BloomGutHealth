import EditorialMedia from './EditorialMedia';
import OrganismPortrait from './OrganismPortrait';
import OrganismPrimer from './OrganismPrimer';
import {reportDateText} from '@shared/report-dates';
import {reportedTaxonAmount,type ReportedTaxon} from '@shared/reported-taxa';
import type {OrganismArtworkSource} from '@shared/scientific-visuals';

type Props={sample:any;taxa:readonly ReportedTaxon[];onOpen:(taxon:ReportedTaxon,trigger:HTMLButtonElement)=>void;onReport:()=>void;onBrowse:()=>void};
export function MicrobiomeEditorialHero({count}:{count?:number}){
 return <header className="microbiome-editorial-hero">
  <div className="microbiome-new-hero" aria-hidden="true"><EditorialMedia slot="microbiome-overview-hero" sizes="(max-width:767px) 38vw, 1200px" priority showCaption={false}/></div>
  <div className="microbiome-hero-copy"><p className="eyebrow">Gut &amp; microbiome</p><h1>Your microbiome</h1>{count!==undefined&&<p className="microbiome-count-pill">{count} source observation{count===1?'':'s'}</p>}</div>
 </header>;
}
export default function MicrobiomeEditorial({sample,taxa,onOpen,onReport,onBrowse}:Props){
 const highlighted=taxa.slice(0,4),featured=highlighted[0],origin=sample.structuredData?.dataOrigin;
 // Each percentage stands alone. Never calculate an Other remainder across
 // potentially overlapping taxonomic ranks or turn qualitative read counts into %.
 const quantitative=taxa.filter(t=>typeof t.abundance==='number'&&Number.isFinite(t.abundance)&&t.abundance>=0&&t.abundance<=100);
 const artwork=(taxon:ReportedTaxon):OrganismArtworkSource=>({reportId:sample.id,observationId:taxon.id,observations:taxa});
 return <div className="microbiome-editorial-overview">
  <section className="microbiome-latest-panel" aria-label="Selected microbiome report"><p className="eyebrow">Your selected report</p><p className="microbiome-latest-count"><strong>{taxa.length}</strong> source observation{taxa.length===1?'':'s'}</p><p>{sample.testingCompany||"Provider not reported"} · {reportDateText(sample)}</p><div className="flex flex-wrap items-center gap-3"><button type="button" className="hero-button min-h-11" onClick={onBrowse}>Browse organisms</button><button type="button" className="text-link min-h-11" onClick={onReport}>Source-linked report available</button></div><p className="panel-note">{typeof origin==='string'&&origin.trim()?origin:'User-supplied report; not independently verified.'} A listing does not establish activity or a healthy amount.</p></section>
  {highlighted.length>0&&<section className="microbiome-highlights" aria-labelledby="microbiome-highlights-heading"><div className="microbiome-section-heading"><h2 id="microbiome-highlights-heading">Highlighted organisms</h2><button type="button" className="text-link min-h-11" onClick={onBrowse}>All organisms</button></div><p className="panel-note">From the selected report, in source order; this is not a health ranking.</p><div className="microbiome-highlight-grid">{highlighted.map(taxon=><button type="button" key={taxon.id} className="microbiome-highlight-card" aria-haspopup="dialog" aria-label={`Open highlighted organism ${taxon.bacterialName}`} onClick={event=>onOpen(taxon,event.currentTarget)}><OrganismPortrait size="card" sourceName={taxon.bacterialName} source={artwork(taxon)}/><i>{taxon.bacterialName}</i><span>Listed in your report</span></button>)}</div></section>}
  <section className="microbiome-relative-panel" aria-labelledby="microbiome-relative-heading"><h2 id="microbiome-relative-heading">Microbiome composition <small>(reported relative abundance)</small></h2>{quantitative.length?<><div className="microbiome-relative-rows">{quantitative.slice(0,5).map(taxon=><div className="microbiome-relative-row" key={taxon.id}><i>{taxon.bacterialName}</i><meter min={0} max={100} value={taxon.abundance!} aria-label={`${taxon.bacterialName}: ${reportedTaxonAmount(taxon)} reported relative abundance`}>{reportedTaxonAmount(taxon)}</meter><span>{reportedTaxonAmount(taxon)}</span></div>)}</div><p className="panel-note">{quantitative.length>5?`First 5 of ${quantitative.length} quantified source observations; all remain in the source list below. `:''}Percentages are shown only when reported by the source. Separate rows may use different taxonomic ranks; no combined total or Other percentage is inferred.</p></>:<p className="panel-note">Relative abundance was not reported for this selection. Listed organisms and qualitative source amounts remain available below.</p>}</section>
  {featured&&<section className="microbiome-featured-organism" aria-labelledby="microbiome-featured-heading"><OrganismPortrait size="card" sourceName={featured.bacterialName} source={artwork(featured)}/><div><h2 id="microbiome-featured-heading"><i>{featured.bacterialName}</i></h2><OrganismPrimer taxon={featured}/><button type="button" className="text-link min-h-11" onClick={event=>onOpen(featured,event.currentTarget)}>Explore this organism</button></div></section>}
  <section className="microbiome-report-context"><h2>About this report</h2><dl><div><dt>Source-linked observations</dt><dd>{taxa.length} source observation{taxa.length===1?'':'s'}<br/>{reportDateText(sample)}</dd></div><div><dt>Taxonomic names from report</dt><dd>Original names are retained. Missing rank or strain resolution stays unknown.</dd></div><div><dt>Source-aware interpretation</dt><dd>General educational context is separate from your reported amounts and does not diagnose health or establish active functions.</dd></div></dl></section>
 </div>;
}
