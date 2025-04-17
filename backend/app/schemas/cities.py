from pydantic import BaseModel
from typing import List

class CityBase(BaseModel):
    name: str

class CitiesCreate(BaseModel):
    cities: List[str] = [
  "अतरिया", "बागबहरा", "बालोद", "भानुप्रतापपुर", "चरोदा", "छुईखदान",
  "दल्ली राजहरा", "धमतरी", "डोंगरगढ़", "डोंगरगाँव", "दुर्ग", "गीदम",
  "जगदलपुर", "जयपुर झाड़ी", "कवर्धा", "केशकाल", "खैरागढ़", "खरीयार रोड", "कोंडागाँव ", "कोरबा",
  "लंजोड़ा", "महासमुंद", "मुड़ीपार", "नगरी", "नारायणपुर", "रायपुर", "राजनांदगाँव",
  "सम्बलपुर", "वैशालीनगर"
]

class City(CityBase):
    id: int

    class Config:
        from_attributes = True
