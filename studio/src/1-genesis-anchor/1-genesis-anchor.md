Scenario: Genesis-Anchor
========================

Flow:
Create Genesis record on Node A
   Expect:
   - record created
   - anchor request sent
on Node B:
   - record created

After some time on Node A
- anchor should be created
- document have anchor state

Then on Node B:
- document have anchor state

   
   
