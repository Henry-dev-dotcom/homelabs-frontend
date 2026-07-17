import { useState } from 'react';
import { AlertTriangle, FileUp, FlaskConical, Upload } from 'lucide-react';
import { Field, MiniRecord, PaginationControls, SectionTitle, StatsGrid, StatusBadge } from '../../components/dashboard/DashboardPrimitives.jsx';


function ConnectionStrip({ connection, loading }) {
  if (!connection) return null;
  return <div className="connection-strip"><strong>{connection.mode}</strong><span>{loading ? 'Loading backend state…' : connection.notice}</span></div>;
}

export function LabPortal({ activePage, data, actions }) {
  const { labSamples, connection, loadingDashboard } = data;
  if (activePage === 'incoming') return <IncomingSamples labSamples={labSamples} actions={actions} />;
  if (activePage === 'processing') return <ProcessingSamples labSamples={labSamples} actions={actions} />;
  if (activePage === 'results') return <ResultUpload labSamples={labSamples} actions={actions} />;
  if (activePage === 'rejected') return <RejectedSamples labSamples={labSamples} actions={actions} />;

  return (
    <div className="dashboard-content">
      <ConnectionStrip connection={connection} loading={loadingDashboard} />
      <StatsGrid stats={[
        ['Incoming', labSamples.filter((s) => s.status === 'Received').length],
        ['Processing', labSamples.filter((s) => s.status === 'Processing').length],
        ['Ready results', labSamples.filter((s) => s.status === 'Result Ready').length],
        ['Rejected', labSamples.filter((s) => s.status === 'Sample Rejected').length]
      ]} />
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Laboratory" title="Sample workload" text="HomeLabs lab and partner labs can now update sample receipt, result readiness, release and rejection state." />
          <div className="record-list">{labSamples.map((sample) => <MiniRecord key={sample.id} title={`${sample.patient} · ${sample.id}`} meta={`${sample.tests.join(', ')} · ${sample.receivedAt}`} status={sample.status} />)}</div>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Quality" title="Lab receipt discipline" text="Labs should confirm sample ID, condition, receipt time and rejection reason where applicable." />
          <div className="policy-list"><span><FlaskConical size={18} /> Confirm sample identity.</span><span><FlaskConical size={18} /> Confirm sample condition.</span><span><FlaskConical size={18} /> Upload or enter result.</span><span><FlaskConical size={18} /> Release to approved recipient.</span></div>
        </div>
      </section>
    </div>
  );
}

function IncomingSamples({ labSamples, actions }) {
  return (
    <div className="dashboard-content">
      <section className="dashboard-section">
        <SectionTitle eyebrow="Incoming" title="Incoming samples" text="Confirm physical sample receipt and begin laboratory processing." />
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead><tr><th>Sample</th><th>Patient</th><th>Tests</th><th>Collected</th><th>Received</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>{labSamples.map((sample) => <tr key={sample.id}><td><strong>{sample.id}</strong><small>{sample.bookingId}</small></td><td>{sample.patient}</td><td>{sample.tests.join(', ')}</td><td>{sample.collectedAt}</td><td>{sample.receivedAt}</td><td><StatusBadge status={sample.status} /></td><td><button className="secondary-button tiny" type="button" disabled={sample.status === 'Processing'} onClick={() => actions.confirmSampleReceipt(sample.id)}>Confirm receipt</button></td></tr>)}</tbody>
          </table>
        </div>
        <PaginationControls meta={labSamples.pagination} label="samples" onPageChange={(page) => actions.loadBackendPage('samples', page)} />
      </section>
    </div>
  );
}

function ProcessingSamples({ labSamples, actions }) {
  return (
    <div className="dashboard-content">
      <section className="dashboard-grid two-columns">
        {labSamples.map((sample) => (
          <div className="dashboard-card" key={sample.id}>
            <MiniRecord title={`${sample.patient} · ${sample.id}`} meta={`${sample.tests.join(', ')} · ${sample.lab}`} status={sample.resultStatus} />
            <div className="lab-action-row">
              <button className="secondary-button" type="button">View custody</button>
              <button className="secondary-button" type="button" onClick={() => actions.markSampleProcessing(sample.id)}>Move to processing</button>
              <button className="primary-button" type="button" onClick={() => actions.markResultReady(sample.id)}>Mark result ready</button>
            </div>
          </div>
        ))}
      </section>
      <PaginationControls meta={labSamples.pagination} label="samples" onPageChange={(page) => actions.loadBackendPage('samples', page)} />
    </div>
  );
}

function ResultUpload({ labSamples, actions }) {
  const [selectedSample, setSelectedSample] = useState(labSamples[0]?.id || '');
  const [releaseRule, setReleaseRule] = useState('Ready for release');
  const readySamples = labSamples.filter((sample) => sample.status === 'Result Ready' || sample.status === 'Result Released');

  return (
    <div className="dashboard-content">
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Results" title="Upload result" text="Report upload on the portal is optional for now — official report management is handled on the LHIMS platform. Lab staff or authorised admin can still enter result details or upload a PDF." />
          <div className="form-grid">
            <Field label="Sample ID"><select value={selectedSample} onChange={(event) => setSelectedSample(event.target.value)}>{labSamples.map((sample) => <option key={sample.id} value={sample.id}>{sample.id} · {sample.patient}</option>)}</select></Field>
            <Field label="Result notes"><textarea placeholder="Enter result notes or internal comment" /></Field>
            <label className="file-input"><input type="file" /> <FileUp size={17} /> Upload result PDF (optional — LHIMS handles official reports)</label>
            <Field label="Release rule"><select value={releaseRule} onChange={(event) => setReleaseRule(event.target.value)}><option>Ready for release</option><option>Release to clinician</option><option>Release to patient</option><option>Release to patient and clinician</option><option>Admin review required</option></select></Field>
          </div>
          <div className="field-actions">
            <button className="primary-button" type="button" onClick={() => actions.markResultReady(selectedSample, releaseRule)}><Upload size={17} /> Mark result ready</button>
            <button className="secondary-button" type="button" onClick={() => actions.releaseResult(selectedSample)}>Release result</button>
          </div>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Result archive" title="Ready for release" text="Results should not be public links. They should route through secure authenticated portals." />
          <div className="record-list">
            {readySamples.map((sample) => <MiniRecord key={sample.id} title={`${sample.patient} · ${sample.tests.join(', ')}`} meta={`${sample.id} · ${sample.lab}`} status={sample.status} />)}
            {readySamples.length === 0 && <div className="empty-panel"><FileUp size={30} /><strong>No result ready yet.</strong><span>Use the result upload form to mark a sample ready.</span></div>}
          </div>
        </div>
      </section>
    </div>
  );
}

function RejectedSamples({ labSamples, actions }) {
  const [selectedSample, setSelectedSample] = useState(labSamples[0]?.id || '');
  const [reason, setReason] = useState('Insufficient sample');
  const rejected = labSamples.filter((sample) => sample.status === 'Sample Rejected');

  return (
    <div className="dashboard-content">
      <section className="dashboard-grid two-columns">
        <div className="dashboard-card">
          <SectionTitle eyebrow="Rejected" title="Rejected sample form" text="Rejected samples notify operations so patient recollection can be scheduled." />
          <div className="form-grid">
            <Field label="Sample ID"><select value={selectedSample} onChange={(event) => setSelectedSample(event.target.value)}>{labSamples.map((sample) => <option key={sample.id} value={sample.id}>{sample.id} · {sample.patient}</option>)}</select></Field>
            <Field label="Rejection reason"><select value={reason} onChange={(event) => setReason(event.target.value)}><option>Insufficient sample</option><option>Hemolysed sample</option><option>Wrong tube</option><option>Unlabelled sample</option><option>Temperature breach</option></select></Field>
            <Field label="Lab note"><textarea placeholder="Explain what operations should do next" /></Field>
          </div>
          <button className="primary-button full" type="button" onClick={() => actions.rejectSample(selectedSample, reason)}><AlertTriangle size={17} /> Submit rejection</button>
        </div>
        <div className="dashboard-card">
          <SectionTitle eyebrow="Rejected sample list" title="Current rejected samples" text="These also appear in operations exceptions." />
          <div className="record-list">
            {rejected.map((sample) => <MiniRecord key={sample.id} title={`${sample.patient} · ${sample.id}`} meta={`${sample.tests.join(', ')} · ${sample.resultStatus}`} status={sample.status} />)}
            {rejected.length === 0 && <div className="empty-panel"><AlertTriangle size={30} /><strong>No rejected sample in current frontend state.</strong><span>When a lab rejects a sample, it will appear here and in operations exceptions.</span></div>}
          </div>
        </div>
      </section>
    </div>
  );
}
