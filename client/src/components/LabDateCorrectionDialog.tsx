import { useRef, useState, useId } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';
import { invalidatePlanningInputs } from '@/lib/planning-cache';
import { Button } from './ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from './ui/alert-dialog';
import { labEnteredContext, markerDefinitions } from '@shared/precision-nutrition';
import { labDateChangeFromLocal, type LabDateChange } from '@shared/lab-date-correction';
import type { AnyLabHistoryRow } from '@shared/lab-history';

export default function LabDateCorrectionDialog({ source, onClose }: { source: AnyLabHistoryRow; onClose: () => void }) {
  const formId=useId();
  const { user } = useAuth(), actor = useRef(user?.id), currentActor = useRef(user?.id);
  currentActor.current = user?.id;
  const entered = labEnteredContext(source);
  const [date, setDate] = useState(entered?.enteredDate || ''), [time, setTime] = useState(entered?.enteredTime || ''), [reason, setReason] = useState(''), [reviewed, setReviewed] = useState(false);
  const [frozen, setFrozen] = useState<{ input: LabDateChange; key: string } | null>(null);
  const receipt = useRef(crypto.randomUUID());
  const ownsDraft = !!user && user.id === actor.current;
  const draft = (() => {
    if (!date || !reason.trim()) return { error: 'Enter a source date and correction reason.' };
    try { return { input: labDateChangeFromLocal(date, time, reason) }; }
    catch (error) { return { error: error instanceof Error && error.name !== 'ZodError' ? error.message : 'Review the date, time and correction reason. Future measurements are not allowed.' }; }
  })();
  const unchanged = entered?.enteredDate === date && (entered?.enteredTime || '') === time;
  const save = useMutation({
    mutationFn: async (request: { input: LabDateChange; key: string }) => {
      if (!actor.current || actor.current !== currentActor.current) throw Error('Your account changed. Reopen this result in your current account.');
      return apiRequest('POST', `/api/precision/labs/${encodeURIComponent(source.id)}/correct-date`, request.input, { 'Idempotency-Key': request.key, 'X-Bloom-Confirm': 'correct-lab-date' });
    },
    onSuccess: async () => {
      if (actor.current !== currentActor.current) return;
      await invalidatePlanningInputs();
      if (actor.current === currentActor.current) onClose();
    },
    onError: async () => { if (actor.current === currentActor.current) await invalidatePlanningInputs(); },
  });
  const raw = 'sourceOnly' in source;
  const name = raw ? source.reportedAnalyte : markerDefinitions.find(marker => marker.id === source.marker)?.name || source.marker;
  const resetReview = () => { setReviewed(false); save.reset(); };
  return <AlertDialog open onOpenChange={open => { if (!open && !save.isPending) onClose(); }}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Correct result date</AlertDialogTitle>
        <AlertDialogDescription>Correct a transcription error against your source report. The original entry is retained. Values, units and report identifiers are preserved. Current recommendations reload; saved precision plans are cleared when a clinical input changes.</AlertDialogDescription>
      </AlertDialogHeader>
      <p>{name} · {raw ? `${source.reportedValue} ${source.reportedUnit || '(unit not supplied)'}` : `${source.value} ${source.unit}${source.unitReview?.status === 'pending' ? ' (unit provisional)' : ''}`}</p>
      <p className="panel-note">Current entered date/time: {entered?.enteredDate ? `${entered.enteredDate}${entered.enteredTime ? ` ${entered.enteredTime}` : ' · time not supplied'}` : 'Not recorded'}. Stored timestamp: {source.measuredAt}</p>
      <label className="block">Correct test date<input className="clinical-input" type="date" value={date} disabled={!!frozen || !ownsDraft} onChange={event => { setDate(event.target.value); resetReview(); }} /></label>
      <label className="block">Correct collection time (optional)<input className="clinical-input" type="time" value={time} disabled={!!frozen || !ownsDraft} onChange={event => { setTime(event.target.value); resetReview(); }} /></label>
      <p className="panel-note">Leave collection time empty when it was not supplied. Enter times in your current timezone; no laboratory timezone is inferred.</p>
      <div><label className="block" htmlFor={formId+"-reason"}>Correction reason</label><textarea id={formId+"-reason"} className="clinical-input" maxLength={300} value={reason} disabled={!!frozen || !ownsDraft} onChange={event => { setReason(event.target.value); resetReview(); }} /></div>
      {!!date && !!reason && draft.error && <p role="alert">{draft.error}</p>}
      {unchanged && <p className="panel-note">Choose a changed test date or collection time.</p>}
      <label className="block"><input type="checkbox" checked={reviewed} disabled={!!frozen || !ownsDraft} onChange={event => setReviewed(event.target.checked)} /> I checked the corrected date and time against the source.</label>
      {!ownsDraft && <p role="alert">Your account changed. Cancel and reopen the result in your current account.</p>}
      {save.isError && <p role="alert">{save.error.message} If the response was lost, retry the same correction. If the source or reference changed, cancel and review the current result.</p>}
      <AlertDialogFooter>
        <Button variant="outline" disabled={save.isPending} onClick={onClose}>Cancel</Button>
        <Button disabled={!ownsDraft || save.isPending || (!frozen && (!reviewed || !draft.input || unchanged))} onClick={() => {
          const request = frozen || (draft.input ? { input: draft.input, key: receipt.current } : null);
          if (request) { setFrozen(request); save.mutate(request); }
        }}>{save.isPending ? 'Saving…' : frozen ? 'Retry date correction' : 'Save corrected date'}</Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
