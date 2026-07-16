#!/usr/bin/env node
/**
 * generate_hacking_tools_docs.js
 *
 * Creates a folder ("Security_Tools_Reference") and, inside it, one text
 * file per well-known security / penetration-testing tool. Each file
 * contains:
 *   - What category of testing the tool is used for
 *   - A short description of what it does
 *   - How to install it (common platforms)
 *   - Basic / common commands to get started
 *
 * This is a documentation generator only. It does not download, run, or
 * configure any tool -- it just writes reference notes to disk.
 *
 * Usage:
 *   node generate_hacking_tools_docs.js
 *
 * Requires only Node.js core modules (fs, path) -- no npm install needed.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// --------------------------------------------------------------------------
// 1. Tool data: category, description, install instructions, basic commands
// --------------------------------------------------------------------------

const TOOLS = {
  'Nmap': {
    category: 'Network Scanning / Reconnaissance',
    description:
      'Nmap (Network Mapper) is used to discover hosts and services on a ' +
      'network by sending packets and analyzing responses. Commonly used ' +
      'for host discovery, port scanning, service/version detection, and ' +
      'OS fingerprinting.',
    install: [
      'Debian/Ubuntu:  sudo apt install nmap',
      'Fedora/RHEL:    sudo dnf install nmap',
      'macOS (brew):   brew install nmap',
      'Windows:        Download installer from https://nmap.org/download.html',
    ],
    basicCommands: [
      'nmap <target>                     # Basic scan of a host',
      'nmap -sV <target>                 # Detect service versions',
      'nmap -O <target>                  # OS detection',
      'nmap -p 1-1000 <target>           # Scan a range of ports',
      'nmap -A <target>                  # Aggressive scan (OS, version, script, traceroute)',
      'nmap -sn 192.168.1.0/24           # Ping sweep to discover live hosts',
    ],
  },

  'Wireshark': {
    category: 'Network Traffic Analysis / Packet Sniffing',
    description:
      'Wireshark is a graphical network protocol analyzer used to capture ' +
      'and inspect packets on a network in real time. Useful for ' +
      'troubleshooting, protocol analysis, and traffic-based investigation.',
    install: [
      'Debian/Ubuntu:  sudo apt install wireshark',
      'Fedora/RHEL:    sudo dnf install wireshark',
      'macOS (brew):   brew install --cask wireshark',
      'Windows:        Download installer from https://www.wireshark.org/download.html',
    ],
    basicCommands: [
      'wireshark                         # Launch the GUI',
      'tshark -D                         # List available capture interfaces (CLI version)',
      'tshark -i eth0                    # Capture on interface eth0',
      'tshark -i eth0 -w capture.pcap    # Capture and save to a file',
      'tshark -r capture.pcap            # Read a saved capture file',
    ],
  },

  'Metasploit': {
    category: 'Exploitation Framework / Penetration Testing',
    description:
      'Metasploit Framework is a widely used platform for developing, ' +
      'testing, and (in authorized engagements) executing exploit code ' +
      'against a target system, primarily used by security professionals ' +
      'for validating patch levels and configurations.',
    install: [
      'Debian/Ubuntu:  curl https://raw.githubusercontent.com/rapid7/metasploit-omnibus/master/config/templates/metasploit-framework-wrappers/msfupdate.erb > msfinstall && chmod +x msfinstall && ./msfinstall',
      'Kali Linux:     Preinstalled (or: sudo apt install metasploit-framework)',
      'macOS (brew):   brew install metasploit',
    ],
    basicCommands: [
      'msfconsole                        # Launch the Metasploit console',
      'search <keyword>                  # Search for a module',
      'use <module_path>                 # Select a module',
      'show options                      # Show configurable options for the module',
      'set RHOSTS <target>                # Set the target host',
      'run / exploit                     # Execute the selected module',
    ],
  },

  'Burp Suite': {
    category: 'Web Application Security Testing',
    description:
      'Burp Suite is an integrated platform for testing web application ' +
      'security. It works as an intercepting proxy, allowing testers to ' +
      'inspect and modify HTTP/S traffic between browser and server, and ' +
      'includes tools for scanning, fuzzing, and repeating requests.',
    install: [
      'Cross-platform: Download from https://portswigger.net/burp/communitydownload',
      'Kali Linux:     Preinstalled Community Edition, or: sudo apt install burpsuite',
    ],
    basicCommands: [
      "1. Launch Burp Suite and start a new project.",
      "2. Configure your browser to use Burp's proxy (default 127.0.0.1:8080).",
      "3. Use 'Proxy > Intercept' to view/modify live requests.",
      "4. Send interesting requests to 'Repeater' to manually resend/edit them.",
      "5. Use 'Target > Site map' to review discovered application structure.",
    ],
  },

  'John the Ripper': {
    category: 'Password Auditing / Cracking',
    description:
      'John the Ripper is a password-auditing tool used to test the ' +
      'strength of passwords by attempting to recover them from hashes ' +
      'using dictionary, brute-force, and rule-based attacks.',
    install: [
      'Debian/Ubuntu:  sudo apt install john',
      'Fedora/RHEL:    sudo dnf install john',
      'macOS (brew):   brew install john',
    ],
    basicCommands: [
      'john --wordlist=rockyou.txt hashes.txt   # Dictionary attack on a hash file',
      'john --show hashes.txt                   # Show cracked passwords',
      'john --format=<hash-type> hashes.txt      # Specify hash format',
      'john --incremental hashes.txt             # Brute-force mode',
    ],
  },

  'Hydra': {
    category: 'Authentication / Brute-Force Testing',
    description:
      'THC-Hydra is a fast network login cracker that supports many ' +
      'protocols (SSH, FTP, HTTP forms, RDP, etc.) and is used to test ' +
      'the resilience of authentication mechanisms against brute-force ' +
      'and dictionary attacks.',
    install: [
      'Debian/Ubuntu:  sudo apt install hydra',
      'Fedora/RHEL:    sudo dnf install hydra',
      'macOS (brew):   brew install hydra',
    ],
    basicCommands: [
      'hydra -l admin -P wordlist.txt ssh://<target>       # Brute force SSH login',
      'hydra -L users.txt -P passwords.txt ftp://<target>  # Try multiple users/passwords on FTP',
      'hydra -l admin -P wordlist.txt <target> http-post-form "/login:user=^USER^&pass=^PASS^:F=incorrect"',
    ],
  },

  'Aircrack-ng': {
    category: 'Wireless Network Security Testing',
    description:
      'Aircrack-ng is a suite of tools for assessing Wi-Fi network ' +
      'security, covering monitoring, packet capture, and testing of ' +
      'WEP/WPA/WPA2 key strength on networks you are authorized to test.',
    install: [
      'Debian/Ubuntu:  sudo apt install aircrack-ng',
      'Fedora/RHEL:    sudo dnf install aircrack-ng',
      'macOS (brew):   brew install aircrack-ng',
    ],
    basicCommands: [
      'airmon-ng start wlan0              # Put wireless interface into monitor mode',
      'airodump-ng wlan0mon               # Discover nearby networks',
      'airodump-ng -c <channel> --bssid <BSSID> -w capture wlan0mon   # Capture traffic for a target AP',
      'aircrack-ng capture-01.cap -w wordlist.txt   # Attempt to recover the key from a capture',
    ],
  },

  'Nikto': {
    category: 'Web Server Vulnerability Scanning',
    description:
      'Nikto is an open-source web server scanner that checks for ' +
      'outdated software, dangerous files, misconfigurations, and known ' +
      'vulnerabilities across thousands of signatures.',
    install: [
      'Debian/Ubuntu:  sudo apt install nikto',
      'Fedora/RHEL:    sudo dnf install nikto',
      'macOS (brew):   brew install nikto',
    ],
    basicCommands: [
      'nikto -h <target-url>              # Basic scan of a target',
      'nikto -h <target-url> -p 80,443    # Scan specific ports',
      'nikto -h <target-url> -o report.html -Format htm   # Save results as HTML',
    ],
  },

  'SQLmap': {
    category: 'Web Application Security Testing (SQL Injection)',
    description:
      'SQLmap is an automated tool for detecting and testing SQL ' +
      'injection vulnerabilities in web applications, and can enumerate ' +
      'database structure once a vulnerability is confirmed, on ' +
      'applications you are authorized to test.',
    install: [
      'Debian/Ubuntu:  sudo apt install sqlmap',
      'pip:            pip install sqlmap',
      'From source:    git clone https://github.com/sqlmapproject/sqlmap.git',
    ],
    basicCommands: [
      'sqlmap -u "http://target/page?id=1"        # Test a URL parameter for SQLi',
      'sqlmap -u "http://target/page?id=1" --dbs   # Enumerate databases if vulnerable',
      'sqlmap -u "http://target/page?id=1" -D dbname --tables  # List tables in a database',
      'sqlmap -u "http://target/page?id=1" --batch  # Run non-interactively with defaults',
    ],
  },

  'Netcat': {
    category: 'Network Utility / Debugging & Testing',
    description:
      "Netcat ('nc') is a versatile networking utility for reading and " +
      'writing data across network connections, often used for banner ' +
      'grabbing, port scanning, simple file transfers, and setting up ' +
      'test listeners during authorized assessments.',
    install: [
      'Debian/Ubuntu:  sudo apt install netcat',
      'Fedora/RHEL:    sudo dnf install nmap-ncat',
      'macOS:          Preinstalled, or: brew install netcat',
    ],
    basicCommands: [
      'nc -lvp 4444                       # Listen on port 4444 (verbose)',
      'nc <target> <port>                 # Connect to a target host/port',
      'nc -zv <target> 1-100               # Scan ports 1-100 on a target',
      'nc -w 3 <target> 80                 # Connect with a 3-second timeout',
    ],
  },

  'OWASP ZAP': {
    category: 'Web Application Security Testing',
    description:
      'OWASP Zed Attack Proxy (ZAP) is a free, open-source web ' +
      'application scanner used to find vulnerabilities during ' +
      'development and testing, offering both automated scanning and ' +
      'manual intercepting-proxy features.',
    install: [
      'Cross-platform: Download from https://www.zaproxy.org/download/',
      'Debian/Ubuntu:  sudo snap install zaproxy --classic',
      'Docker:         docker pull zaproxy/zap-stable',
    ],
    basicCommands: [
      "1. Launch ZAP and enter the target URL in 'Quick Start > Automated Scan'.",
      "2. Or configure your browser to use ZAP's local proxy (default 127.0.0.1:8080).",
      "3. Use 'Spider' to crawl the site and 'Active Scan' to test for vulnerabilities.",
      "4. Review findings under the 'Alerts' tab.",
    ],
  },

  'Gobuster': {
    category: 'Web Directory / DNS Enumeration',
    description:
      'Gobuster is a fast tool written in Go for brute-forcing URIs ' +
      '(directories/files), DNS subdomains, virtual host names, and ' +
      'S3 buckets, commonly used during reconnaissance of a target web ' +
      'application.',
    install: [
      'Debian/Ubuntu:  sudo apt install gobuster',
      'go install:     go install github.com/OJ/gobuster/v3@latest',
      'macOS (brew):   brew install gobuster',
    ],
    basicCommands: [
      'gobuster dir -u http://target -w wordlist.txt        # Directory/file brute force',
      'gobuster dns -d target.com -w subdomains.txt          # Subdomain enumeration',
      'gobuster vhost -u http://target -w wordlist.txt       # Virtual host discovery',
    ],
  },

  'Hashcat': {
    category: 'Password Auditing / Cracking (GPU-accelerated)',
    description:
      'Hashcat is a high-performance password recovery tool that uses ' +
      'GPU acceleration to test large numbers of password guesses ' +
      'against hash values, supporting many hash algorithms and attack ' +
      'modes.',
    install: [
      'Debian/Ubuntu:  sudo apt install hashcat',
      'Fedora/RHEL:    sudo dnf install hashcat',
      'macOS (brew):   brew install hashcat',
    ],
    basicCommands: [
      'hashcat -m 0 -a 0 hashes.txt wordlist.txt   # Dictionary attack on MD5 hashes',
      'hashcat -m 1000 -a 3 hashes.txt ?a?a?a?a?a?a # Brute-force NTLM hashes (mask attack)',
      'hashcat --show hashes.txt                    # Show already-cracked hashes',
    ],
  },

  'Nessus': {
    category: 'Vulnerability Scanning',
    description:
      'Nessus is a widely used commercial vulnerability scanner that ' +
      'checks systems and networks against a large database of known ' +
      'vulnerabilities, misconfigurations, and missing patches.',
    install: [
      'Cross-platform: Download installer from https://www.tenable.com/downloads/nessus',
      "Requires an activation code (free 'Nessus Essentials' tier available for limited use).",
    ],
    basicCommands: [
      '1. Install and start the Nessus service (systemctl start nessusd on Linux).',
      '2. Open https://localhost:8834 in a browser to access the web UI.',
      '3. Create a new scan, specify the target(s), and select a scan template.',
      '4. Launch the scan and review the vulnerability report once complete.',
    ],
  },

  'Maltego': {
    category: 'OSINT / Reconnaissance & Link Analysis',
    description:
      'Maltego is an OSINT and graphical link-analysis tool used to ' +
      'visually map relationships between people, domains, IP ' +
      'addresses, and other entities during the reconnaissance phase ' +
      'of an assessment.',
    install: [
      'Cross-platform: Download from https://www.maltego.com/downloads/',
      'Kali Linux:     Preinstalled, or: sudo apt install maltego',
    ],
    basicCommands: [
      '1. Launch Maltego and log in / register a Community Edition account.',
      '2. Create a new graph and add a starting entity (e.g., a domain).',
      "3. Right-click the entity and run 'Transforms' to gather related data.",
      '4. Review the resulting graph of linked entities.',
    ],
  },
};

// --------------------------------------------------------------------------
// 2. File generation logic
// --------------------------------------------------------------------------

const FOLDER_NAME = 'Security_Tools_Reference';

const DISCLAIMER =
  'DISCLAIMER: This document is for educational and authorized security-\n' +
  'testing purposes only. Only use these tools against systems and\n' +
  'networks you own or have explicit written permission to test.\n' +
  'Unauthorized access to computer systems is illegal in most\n' +
  'jurisdictions.\n';

function safeFilename(name) {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_') + '.txt';
}

function formatTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  );
}

function buildFileContent(name, info) {
  const lines = [];
  lines.push('='.repeat(70));
  lines.push(`TOOL: ${name}`);
  lines.push('='.repeat(70));
  lines.push('');
  lines.push(DISCLAIMER);
  lines.push('');
  lines.push('CATEGORY / USED FOR:');
  lines.push(`  ${info.category}`);
  lines.push('');
  lines.push('DESCRIPTION:');
  lines.push(`  ${info.description}`);
  lines.push('');
  lines.push('HOW TO INSTALL:');
  info.install.forEach((step) => lines.push(`  - ${step}`));
  lines.push('');
  lines.push('BASIC / COMMON COMMANDS:');
  info.basicCommands.forEach((cmd) => lines.push(`  ${cmd}`));
  lines.push('');
  lines.push('-'.repeat(70));
  lines.push(`Generated on: ${formatTimestamp()}`);
  lines.push('-'.repeat(70));
  return lines.join('\n');
}

function buildIndexContent(tools) {
  const names = Object.keys(tools);
  const lines = [];
  lines.push('='.repeat(70));
  lines.push('SECURITY TOOLS REFERENCE - INDEX');
  lines.push('='.repeat(70));
  lines.push('');
  lines.push(DISCLAIMER);
  lines.push('');
  lines.push(`Total tools documented: ${names.length}`);
  lines.push('');
  names.forEach((name) => {
    const info = tools[name];
    const fname = safeFilename(name);
    lines.push(`- ${name.padEnd(20)} -> ${info.category}   (file: ${fname})`);
  });
  lines.push('');
  lines.push(`Generated on: ${formatTimestamp()}`);
  return lines.join('\n');
}

function main() {
  const baseDir = path.join(process.cwd(), FOLDER_NAME);

  try {
    fs.mkdirSync(baseDir, { recursive: true });
  } catch (err) {
    console.error(`Failed to create folder '${baseDir}': ${err.message}`);
    process.exit(1);
  }

  console.log(`Creating reference folder: ${baseDir}\n`);

  // Write index file
  const indexPath = path.join(baseDir, '00_INDEX.txt');
  fs.writeFileSync(indexPath, buildIndexContent(TOOLS), 'utf8');
  console.log(`  [+] Created ${path.basename(indexPath)}`);

  // Write one file per tool
  Object.entries(TOOLS).forEach(([name, info]) => {
    const filename = safeFilename(name);
    const filepath = path.join(baseDir, filename);
    const content = buildFileContent(name, info);
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`  [+] Created ${filename}`);
  });

  const count = Object.keys(TOOLS).length;
  console.log(`\nDone. ${count} tool files + 1 index file created in '${baseDir}'.`);
}

main();
