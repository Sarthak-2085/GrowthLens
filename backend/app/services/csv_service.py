import io

import pandas as pd

REQUIRED_COLUMNS = ["campaign", "budget", "clicks", "impressions", "conversions", "revenue"]
INT_COLUMNS = ["clicks", "impressions", "conversions"]
FLOAT_COLUMNS = ["budget", "revenue"]


class CsvValidationError(Exception):
    """Raised when the CSV can't be processed at all (bad format / missing columns / no valid rows)."""


def parse_campaign_csv(file_bytes: bytes) -> tuple[list[dict], list[dict]]:
    """Parse and validate an uploaded campaign CSV.

    Returns (valid_rows, row_errors). Individual bad rows are skipped and
    reported in row_errors rather than failing the whole upload — only
    structural problems (unreadable file, missing columns, zero valid rows)
    raise CsvValidationError.
    """
    try:
        df = pd.read_csv(io.BytesIO(file_bytes))
    except Exception as exc:
        raise CsvValidationError(f"Could not read file as CSV: {exc}") from exc

    df.columns = [str(c).strip().lower() for c in df.columns]

    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise CsvValidationError(
            f"Missing required column(s): {', '.join(missing)}. "
            f"Expected columns: {', '.join(REQUIRED_COLUMNS)}"
        )

    valid_rows: list[dict] = []
    row_errors: list[dict] = []

    for idx, row in df.iterrows():
        row_number = idx + 2  # +1 for 0-index, +1 for header row

        name = str(row.get("campaign", "")).strip()
        if not name or name.lower() == "nan":
            row_errors.append({"row": row_number, "reason": "Missing campaign name"})
            continue

        parsed: dict = {"campaign_name": name}
        row_ok = True

        for col in FLOAT_COLUMNS + INT_COLUMNS:
            raw_value = row.get(col)
            try:
                num = float(raw_value)
                if pd.isna(num) or num < 0:
                    raise ValueError
            except (TypeError, ValueError):
                row_errors.append(
                    {"row": row_number, "reason": f"Invalid value for '{col}': {raw_value!r}"}
                )
                row_ok = False
                break
            parsed[col] = int(num) if col in INT_COLUMNS else round(num, 2)

        if row_ok:
            valid_rows.append(parsed)

    if not valid_rows:
        raise CsvValidationError("No valid rows found in CSV after validation.")

    return valid_rows, row_errors
