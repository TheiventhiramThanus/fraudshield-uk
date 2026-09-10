# Approved training data

Place an export from the Admin Dashboard here as `approved_training_samples.csv`.

Required columns:

```text
kind,content,label,category,source,review_status
```

Only use de-identified, admin-approved samples. Do not treat model suggestions
as ground truth and do not add raw user submissions to this directory.

Training creates an inactive review artifact by default. A model can affect live
predictions only when the admin deliberately uses `--activate` and its held-out
F1 meets the configured threshold. Never activate the bundled demo CSV.

## Clean an external approved dataset

The dashboard export is already de-identified. For a separately sourced and
approved CSV, run the cleaner before training. It redacts emails, UK mobile
numbers, long numeric identifiers and URL paths; standardises labels; removes
invalid rows; and removes duplicates. It prints an audit summary, so rejected
rows are visible.

```powershell
backend/.venv/Scripts/python backend/scripts/clean_training_data.py --input backend/data/raw_approved.csv --output backend/data/approved_training_samples.csv
```
