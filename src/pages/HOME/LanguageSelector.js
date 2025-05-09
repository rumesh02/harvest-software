import React from "react";

const LanguageSelector = ({ language, setLanguage }) => {

    return (
        <div className="language-selector">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="English">English</option>
                <option value="Sinhala">සිංහල</option>
                <option value="Tamil">தமிழ்</option>
            </select>
        </div>
    );
};

export default LanguageSelector;
