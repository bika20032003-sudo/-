import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, ChevronDown, ChevronUp, X, Users } from 'lucide-react';
import defaultForceData from '../data/force_data.json';

// Normalize Arabic text for robust search matching
const normalizeArabic = (text) => {
  if (!text) return '';
  return String(text)
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove harakat
    .replace(/[إأآاٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ىي]/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .toLowerCase();
};

export default function ForceNameAutocomplete({
  value = '',
  onChange,
  onSelect,
  forceMembers = null,
  placeholder = 'اكتب أول حرف لعرض الأسماء المطابقة...',
  className = '',
  inputStyle = {},
  disabled = false,
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Use provided forceMembers or fallback to default imported 2,211 members
  const allMembers = useMemo(() => {
    if (Array.isArray(forceMembers) && forceMembers.length > 0) {
      return forceMembers;
    }
    return defaultForceData || [];
  }, [forceMembers]);

  // Keep internal input text in sync when external value changes
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter members based on search term (name, financial number, national ID, or department)
  const filteredMembers = useMemo(() => {
    const raw = (searchTerm || '').trim();
    if (!raw) {
      // Show first 40 members by default when list is opened without filter
      return allMembers.slice(0, 40);
    }

    const norm = normalizeArabic(raw);
    return allMembers
      .filter((m) => {
        const normName = normalizeArabic(m.name);
        const finNo = String(m.financial_number || m.job_number || '');
        const natId = String(m.national_id || '');
        const dept = normalizeArabic(m.department || m.job_title || '');

        return (
          normName.includes(norm) ||
          finNo.includes(norm) ||
          natId.includes(norm) ||
          dept.includes(norm)
        );
      })
      .slice(0, 60); // Cap to 60 for ultra-fast rendering
  }, [allMembers, searchTerm]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onChange) onChange(val);
    setIsOpen(true);
  };

  const handleSelect = (member) => {
    setSearchTerm(member.name);
    setIsOpen(false);
    if (onChange) onChange(member.name);
    if (onSelect) onSelect(member);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSearchTerm('');
    if (onChange) onChange('');
    if (inputRef.current) inputRef.current.focus();
    setIsOpen(true);
  };

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    if (!isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`force-name-autocomplete-wrap ${className}`} ref={containerRef}>
      {/* Search Input Box */}
      <div className="autocomplete-input-box" onClick={() => !isOpen && setIsOpen(true)}>
        <input
          ref={inputRef}
          type="text"
          className="autocomplete-field-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          required={required}
          style={inputStyle}
          autoComplete="off"
        />

        <div className="autocomplete-input-actions">
          {searchTerm && (
            <button
              type="button"
              className="btn-action-clear-name"
              onClick={handleClear}
              title="مسح الحقل"
            >
              <X size={15} />
            </button>
          )}

          <button
            type="button"
            className="btn-action-toggle-dropdown"
            onClick={toggleDropdown}
            title={isOpen ? 'إغلاق القائمة' : 'فتح قائمة الأسماء'}
          >
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Dropdown Popup Card - Exact Replica of User Photo */}
      {isOpen && (
        <div className="force-names-dropdown-popup">
          {/* Header Row */}
          <div className="dropdown-popup-header">
            <div className="popup-title-side">
              <Search size={16} className="search-icon-title" />
              <span className="popup-main-title">
                قائمة الأسماء من قاعدة القوة العمومية ({allMembers.length || 2211} فرد)
              </span>
            </div>

            {/* Results Counter Card */}
            <div className="names-counter-card">
              <span className="counter-number">{filteredMembers.length}</span>
              <span className="counter-label">اسم</span>
            </div>
          </div>

          {/* Scrollable Members List */}
          <div className="dropdown-popup-body">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <div
                  key={member.id || member.job_number || member.name}
                  className="name-card-row"
                  onClick={() => handleSelect(member)}
                >
                  {/* Right Details */}
                  <div className="name-card-details">
                    <div className="name-card-primary">
                      <span className="name-full-text">{member.name}</span>
                      <span className="type-badge-outline">{member.type || 'مدني'}</span>
                    </div>

                    <div className="name-card-subline">
                      <span className="sub-type">{member.type || 'مدني'}</span>
                      <span className="dot-divider">▪</span>
                      <span className="sub-fn">
                        ر.م: {member.financial_number || member.job_number || '—'}
                      </span>
                    </div>

                    <div className="name-card-dept">
                      <span className="dot-divider">▪</span>
                      <span>{member.department || member.job_title || 'الشؤون الإدارية والمالية'}</span>
                    </div>
                  </div>

                  {/* Left Action Button: اختيار */}
                  <div className="name-card-action">
                    <button
                      type="button"
                      className="btn-select-member"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(member);
                      }}
                    >
                      اختيار
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="popup-no-results">
                <Users size={28} color="#94a3b8" />
                <p>لا توجد أسماء مطابقة لـ "{searchTerm}" في قاعدة القوة العمومية.</p>
              </div>
            )}
          </div>

          {/* Footer Instruction Note */}
          <div className="dropdown-popup-footer">
            <span>* اكتب الحرف الأول للترشيح المباشر، أو انقر على أي اسم لتعبئة البيانات تلقائياً</span>
          </div>
        </div>
      )}
    </div>
  );
}
