# Changes Directory

This directory contains walkthrough documentation for all changes made to the project.

## File Naming Convention

Files are named using the format: `YYYY-MM-DD_descriptive-title.md`

Example: `2025-12-27_enhanced-inventory-history-response.md`

## How to Update

To copy the latest walkthrough files from the artifacts directory, run:

```bash
./copy-walkthroughs.sh
```

This script will:
1. Search for all `walkthrough.md` files in the artifacts directory
2. Extract the title from each walkthrough
3. Copy them to the `changes` directory with date-tagged filenames
4. Preserve the original content

## Current Changes

This directory contains documentation for:
- Backend API implementations
- Frontend UI enhancements
- Bug fixes and improvements
- Feature additions
- Database schema changes
- Infrastructure updates

Each file contains detailed information about what was changed, why, and how to use the new features.
