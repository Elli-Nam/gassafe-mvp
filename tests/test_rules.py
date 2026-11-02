"""Rule tests: bottom-ring == QR, else fraud. No server needed."""

from app import rules


def test_npa_format_accepted():
    assert rules.is_valid_serial("NPA-CRM-GH-00001")
    assert rules.serial_kind("npa-crm-gh-00042") == "npa"


def test_legacy_format_accepted_qr_copies_ring():
    assert rules.serial_kind("GC-12345") == "legacy"
    assert rules.serials_match("GC-12345", "gc-12345")


def test_unknown_format_rejected():
    assert not rules.is_valid_serial("FAKE-999")


def test_mismatch_is_fraud():
    assert not rules.serials_match("NPA-CRM-GH-00001", "NPA-CRM-GH-00002")
    assert rules.match_badge(False) == "RED"
    assert rules.match_badge(True) == "GREEN"


def test_qr_checksum_roundtrip():
    url = rules.qr_url("NPA-CRM-GH-00001")
    k = url.split("k=")[1]
    assert rules.verify_checksum("NPA-CRM-GH-00001", k)
    assert not rules.verify_checksum("NPA-CRM-GH-00002", k)
