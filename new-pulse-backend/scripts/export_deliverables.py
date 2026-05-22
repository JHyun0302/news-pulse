#!/usr/bin/env python3
"""Export News Pulse SQLite verification artifacts.

The script intentionally uses only Python standard library modules so M7 QA can
run it on a plain evaluator machine after the backend has produced a SQLite DB.
"""

from __future__ import annotations

import argparse
import csv
import sqlite3
from pathlib import Path


EXPORT_TABLES = ("articles", "article_categories", "push_histories")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Export News Pulse SQLite tables to CSV.")
    parser.add_argument("--db", default="news-pulse.sqlite", help="SQLite DB file path")
    parser.add_argument("--out", default="deliverables", help="Output directory")
    parser.add_argument(
        "--include-db-copy",
        action="store_true",
        help="Also copy the SQLite DB into the output directory for local QA review",
    )
    parser.add_argument("--db-copy-name", default="news-pulse-qa.sqlite", help="SQLite copy filename")
    return parser.parse_args()


def export_table(connection: sqlite3.Connection, table: str, output: Path) -> int:
    cursor = connection.execute(f"SELECT * FROM {table}")
    rows = cursor.fetchall()
    headers = [description[0] for description in cursor.description]
    with output.open("w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(headers)
        writer.writerows(rows)
    return len(rows)


def main() -> None:
    args = parse_args()
    db_path = Path(args.db)
    if not db_path.exists():
        raise SystemExit(f"SQLite DB not found: {db_path}")

    output_dir = Path(args.out)
    output_dir.mkdir(parents=True, exist_ok=True)

    with sqlite3.connect(db_path) as connection:
        summary_rows = []
        for table in EXPORT_TABLES:
            row_count = export_table(connection, table, output_dir / f"{table}.csv")
            summary_rows.append((table, row_count))

    if args.include_db_copy:
        import shutil

        shutil.copy2(db_path, output_dir / args.db_copy_name)

    with (output_dir / "export-summary.csv").open("w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["table", "row_count"])
        writer.writerows(summary_rows)

    print(f"Exported {len(EXPORT_TABLES)} tables to {output_dir}")


if __name__ == "__main__":
    main()
