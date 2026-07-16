# Security Tools Reference Generator

Generate a local reference folder documenting 15 well-known security /
penetration-testing tools — what each one is used for, how to install it,
and its basic commands. Available in **Python**, **Bash**, and
**JavaScript (Node.js)** — pick whichever you have installed. All three
produce identical output.

> ⚠️ **Disclaimer:** This is a documentation generator only. It does not
> download, run, configure, or exploit anything — it just writes reference
> notes to disk. Every generated file also carries a reminder that these
> tools should only be used against systems and networks you own or have
> explicit written permission to test.

## Files

| Script | Language | Requirements |
|---|---|---|
| `generate_hacking_tools_docs.py` | Python | Python 3 (no external packages) |
| `generate_hacking_tools_docs.sh` | Bash | Bash 4+ (Linux/macOS/WSL) |
| `generate_hacking_tools_docs.js` | JavaScript | Node.js (no npm install needed) |

## Usage

Run whichever version you prefer from a terminal:

```bash
# Python
python3 generate_hacking_tools_docs.py

# Bash
chmod +x generate_hacking_tools_docs.sh
./generate_hacking_tools_docs.sh

# JavaScript / Node.js
node generate_hacking_tools_docs.js
```

Each command is self-contained — just run it and everything is created
automatically, no arguments or setup required.

## What gets created

A folder named `Security_Tools_Reference` in your current directory:

```
Security_Tools_Reference/
├── 00_INDEX.txt          # Overview list of every tool + category
├── nmap.txt
├── wireshark.txt
├── metasploit.txt
├── burp_suite.txt
├── john_the_ripper.txt
├── hydra.txt
├── aircrack-ng.txt
├── nikto.txt
├── sqlmap.txt
├── netcat.txt
├── owasp_zap.txt
├── gobuster.txt
├── hashcat.txt
├── nessus.txt
└── maltego.txt
```

Running the script again simply overwrites the files with the same
content (safe to re-run any time).

## What each tool file contains

```
======================================================================
TOOL: <name>
======================================================================

DISCLAIMER: ...

CATEGORY / USED FOR:
  <what kind of testing this tool is for>

DESCRIPTION:
  <what the tool does>

HOW TO INSTALL:
  - <platform-specific install commands>

BASIC / COMMON COMMANDS:
  <starter commands to use the tool>

----------------------------------------------------------------------
Generated on: <timestamp>
----------------------------------------------------------------------
```

## Tools covered

| Tool | Category |
|---|---|
| Nmap | Network Scanning / Reconnaissance |
| Wireshark | Network Traffic Analysis / Packet Sniffing |
| Metasploit | Exploitation Framework / Penetration Testing |
| Burp Suite | Web Application Security Testing |
| John the Ripper | Password Auditing / Cracking |
| Hydra | Authentication / Brute-Force Testing |
| Aircrack-ng | Wireless Network Security Testing |
| Nikto | Web Server Vulnerability Scanning |
| SQLmap | Web Application Security Testing (SQL Injection) |
| Netcat | Network Utility / Debugging & Testing |
| OWASP ZAP | Web Application Security Testing |
| Gobuster | Web Directory / DNS Enumeration |
| Hashcat | Password Auditing / Cracking (GPU-accelerated) |
| Nessus | Vulnerability Scanning |
| Maltego | OSINT / Reconnaissance & Link Analysis |

## Adding more tools

Each script keeps its tool data in one place near the top:

- **Python:** the `TOOLS` dictionary
- **Bash:** the `TOOLS` array (pipe-separated fields, `~` for multi-line lists)
- **JavaScript:** the `TOOLS` object

Add a new entry with the same shape (category, description, install
steps, basic commands) and re-run the script — a new file is generated
automatically, and the index updates to include it.
