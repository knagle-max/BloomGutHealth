"""
Data Processor: Handles microbiome test file uploads and preprocessing.

This module processes various microbiome file formats (FASTQ, FASTA, CSV)
and prepares them for ML analysis.
"""

from fastapi import UploadFile
import json
from typing import Dict, Any
from pathlib import Path

class DataProcessor:
    """
    Processes uploaded microbiome test files.
    """
    
    def __init__(self):
        self.upload_dir = Path("/tmp/microbiome_uploads")
        self.upload_dir.mkdir(exist_ok=True)
    
    async def process_upload(self, file: UploadFile) -> Dict[str, Any]:
        """
        Process uploaded file and extract microbiome data.
        
        Supports:
        - FASTQ/FASTA: Raw sequencing data
        - CSV: Pre-processed bacterial abundance data
        - JSON: Structured microbiome data
        """
        
        if not file.filename:
            raise ValueError("No filename provided")
        
        file_extension = file.filename.split('.')[-1].lower()
        file_path = self.upload_dir / file.filename
        
        # Save file
        content = await file.read()
        with open(file_path, 'wb') as f:
            f.write(content)
        
        # Process based on format
        if file_extension in ['fastq', 'fasta', 'fa', 'fq']:
            result = self._process_sequence_file(file_path, file_extension)
        elif file_extension == 'csv':
            result = self._process_csv_file(file_path)
        elif file_extension == 'json':
            result = self._process_json_file(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
        
        return {
            "file_path": str(file_path),
            "format": file_extension,
            "preview": result
        }
    
    def _process_sequence_file(self, file_path: Path, format: str) -> Dict[str, Any]:
        """
        Process FASTQ/FASTA sequencing files.
        In production, this would use BioPython for sequence analysis.
        """
        try:
            from Bio import SeqIO
            
            # Read first 5 sequences as preview
            sequences = []
            with open(file_path, 'r') as f:
                for i, record in enumerate(SeqIO.parse(f, format)):
                    if i >= 5:
                        break
                    sequences.append({
                        "id": record.id,
                        "length": len(record.seq),
                        "sequence": str(record.seq)[:50] + "..." if len(record.seq) > 50 else str(record.seq)
                    })
            
            return {
                "type": "sequence_data",
                "format": format,
                "preview_sequences": sequences,
                "note": "Raw sequences will be processed for taxonomic profiling"
            }
        except Exception as e:
            return {
                "type": "sequence_data",
                "format": format,
                "error": str(e),
                "note": "File uploaded successfully, processing may require additional tools"
            }
    
    def _process_csv_file(self, file_path: Path) -> Dict[str, Any]:
        """
        Process CSV file with bacterial abundance data.
        """
        import csv
        
        bacteria_data = []
        with open(file_path, 'r') as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                if i >= 5:
                    break
                bacteria_data.append(row)
        
        return {
            "type": "abundance_data",
            "format": "csv",
            "preview_rows": bacteria_data,
            "note": "Bacterial abundance data ready for analysis"
        }
    
    def _process_json_file(self, file_path: Path) -> Dict[str, Any]:
        """
        Process JSON file with structured microbiome data.
        """
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        return {
            "type": "structured_data",
            "format": "json",
            "preview": data if isinstance(data, dict) else data[:5] if isinstance(data, list) else str(data)[:200],
            "note": "Structured data ready for analysis"
        }
