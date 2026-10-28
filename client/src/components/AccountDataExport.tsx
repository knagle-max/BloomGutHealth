import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { downloadAccountFile } from "@/lib/account-download";
import { Button } from "@/components/ui/button";
export default function AccountDataExport() {
  const [acknowledged,setAcknowledged]=useState(false);
  const download=useMutation({mutationFn:async()=>{
    await downloadAccountFile("/api/account/export","bloom-account-records.json");
  }});
  return <div className="space-y-3"><h3>Download my account records</h3><p>One JSON file of your stored records and historical model metadata.</p><p className="panel-note">Unsupported model scores, predictions and advice are withheld. Downloading does not erase records or revoke permissions.</p><details><summary>What’s included?</summary><p>Profile, meal journal, gut reports, biology records, private labels, settings, training, check-ins and health-source records where storage is provisioned. Original observations, units and provenance are preserved.</p><p className="panel-note">Excludes passwords, sessions, internal paths, operational logs, backups and records held independently by external providers.</p></details><label className="block"><input type="checkbox" checked={acknowledged} onChange={e=>setAcknowledged(e.target.checked)}/> I understand this file contains sensitive health information and will store it privately.</label><Button variant="outline" disabled={!acknowledged||download.isPending} onClick={()=>download.mutate()}>{download.isPending?"Preparing account records…":"Download my account records"}</Button>{download.isSuccess&&<p role="status">Download prepared. Check your browser downloads and store the file privately.</p>}{download.error&&<p role="alert">{download.error.message}</p>}</div>;
}
